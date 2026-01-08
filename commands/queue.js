
const { SlashCommandBuilder } = require('discord.js');
const { safeEdit } = require("../utils/respond");
const { infoRadio, errRadio } = require('../utils/embeds');
const { checkMusicPerm } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Afficher la file d’attente'),
  async execute(interaction, client, config) {
    if (!checkMusicPerm(interaction.user.id, config)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")], ephemeral: true }).catch(() => {});
    }

    // Public response (visible in the channel)
    await interaction.deferReply();

    const state = client.player.getState(interaction.guildId);
    const list = state.queue;
    if (!state.current && list.length === 0) {
      return safeEdit(interaction, { embeds: [infoRadio(interaction, 'File d’attente', 'La file est vide.', '🗒️')] });
    }

    let desc = "";
    if (state.current) desc += `🎶 En cours: **${state.current.title}**\n\n`;
    if (list.length) {
      desc += list.slice(0, 10).map((t, i) => `${i + 1}. ${t.title}`).join('\n');
      if (list.length > 10) desc += `\n… +${list.length - 10} autres`;
    }

    return safeEdit(interaction, { embeds: [infoRadio(interaction, 'File d’attente', desc || 'La file est vide.', '🗒️')] });
  }
};
