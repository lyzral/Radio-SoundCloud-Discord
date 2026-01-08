// Lavalink = audio node externe. On n'utilise pas @discordjs/voice ici,
// donc plus de soucis "No compatible encryption modes" sur VPS.
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config.js');
const { loadCommands } = require('./handlers/commandLoader');
const { registerCommands } = require('./handlers/registerCommands');
const { createVoiceManager } = require('./handlers/voiceManager');
const { err } = require('./utils/embeds');

function validateConfig() {
  const missing = [];
  for (const k of ['TOKEN', 'CLIENT_ID', 'GUILD_ID', 'SYS_ID']) {
    if (!config[k] || String(config[k]).includes('PASTE_')) missing.push(k);
  }
  // Lavalink config (defaults ok, but password must match your Lavalink server)
  if (!config.LAVALINK) {
    config.LAVALINK = { host: '127.0.0.1', port: 2333, password: 'youshallnotpass', secure: false };
  }
  if (missing.length) {
    console.error('❌ Config missing:', missing.join(', '));
    console.error('➡️  Open config.js and fill the values.');
    process.exit(1);
  }
}

async function main() {
  validateConfig();

  process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
  process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
  });

  // Load commands
  const cmds = loadCommands();
  client.commands = new Collection(cmds);

  // Register commands (guild)
  try {
    await registerCommands(config, Array.from(cmds.values()).map(c => c.data.toJSON()));
    console.log(`✅ Slash commands registered to guild ${config.GUILD_ID}`);
  } catch (e) {
    console.error('❌ Failed to register slash commands:', e);
    process.exit(1);
  }

  // Player
  const voiceManager = createVoiceManager(client, config);
  client.player = voiceManager;

  client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client, config);
    } catch (e) {
      console.error('Command error:', e);
      const payload = { embeds: [err("Une erreur est survenue. Réessaie.")], ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  });

  await client.login(config.TOKEN);
}

main();
