const { REST, Routes } = require('discord.js');

/**
 * Registers slash commands to ONE guild for instant availability.
 *
 * Why duplicates happen:
 * If you previously registered commands globally for this same bot application,
 * Discord can show duplicates (global + guild).
 *
 * We clear GLOBAL commands first, then register GUILD commands.
 */
async function registerCommands(config, commandData) {
  const rest = new REST({ version: '10' }).setToken(config.TOKEN);

  // Clear global commands to prevent duplicates in the UI
  await rest.put(
    Routes.applicationCommands(config.CLIENT_ID),
    { body: [] }
  );

  // Register guild commands (instant)
  await rest.put(
    Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
    { body: commandData }
  );
}

module.exports = { registerCommands };
