const { EmbedBuilder } = require('discord.js');

// Colors picked to look close to Discord's "orange" accent seen in the screenshot.
const COLORS = {
  ok: 0xF59E0B,
  info: 0xF59E0B,
  err: 0xEF4444,
  neutral: 0x2b2d31
};

function formatFooterDate(date = new Date()) {
  // Simple, consistent footer date in French (no Intl dependency quirks).
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function radioEmbed(interaction, { emoji = '📻', title, description, kind = 'neutral', requestedBy = true } = {}) {
  const client = interaction?.client;
  const botName = client?.user?.username || 'Radio';
  const botAvatar = client?.user?.displayAvatarURL?.() || null;
  const username = interaction?.user ? `<@${interaction.user.id}>` : 'Inconnu';

  const embed = new EmbedBuilder()
    .setAuthor({ name: botName, iconURL: botAvatar || undefined })
    .setTitle(`${emoji} ${title}`)
    .setDescription(description || null)
    .setColor(COLORS[kind] ?? COLORS.neutral)
    .setTimestamp();

  if (requestedBy) {
    embed.addFields({ name: 'Demandé par', value: username, inline: false });
  }

  embed.setFooter({ text: `Radio SoundCloud • @lyzral • ${formatFooterDate()}`, iconURL: botAvatar || undefined });
  return embed;
}

function okRadio(interaction, title, description, emoji = '✅') {
  return radioEmbed(interaction, { emoji, title, description, kind: 'ok' });
}

function infoRadio(interaction, title, description, emoji = 'ℹ️') {
  return radioEmbed(interaction, { emoji, title, description, kind: 'info' });
}

function errRadio(interaction, title, description, emoji = '❌') {
  return radioEmbed(interaction, { emoji, title, description, kind: 'err' });
}

// Backward compatible helpers (older commands may still import these)
function makeEmbed(title, description) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(COLORS.neutral).setTimestamp();
}
function ok(description) { return makeEmbed('✅ Succès', description); }
function info(description) { return makeEmbed('ℹ️ Info', description); }
function err(description) { return makeEmbed('❌ Erreur', description); }

module.exports = {
  makeEmbed,
  ok,
  info,
  err,
  radioEmbed,
  okRadio,
  infoRadio,
  errRadio
};
