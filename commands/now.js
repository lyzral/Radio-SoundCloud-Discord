
const { SlashCommandBuilder } = require('discord.js');
const { safeEdit } = require("../utils/respond");
const { infoRadio, errRadio } = require('../utils/embeds');
const { checkMusicPerm } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('now')
    .setDescription('Afficher la musique en cours'),
  async execute(interaction, client, config) {
    if (!checkMusicPerm(interaction.user.id, config)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")], ephemeral: true }).catch(() => {});
    }

    // Public response (visible in the channel)
    await interaction.deferReply();

    const state = client.player.getState(interaction.guildId);
    if (!state.current) {
      return safeEdit(interaction, { embeds: [infoRadio(interaction, 'Aucune lecture', 'Aucune musique en cours.', '🎧')] });
    }

    return safeEdit(interaction, { embeds: [infoRadio(interaction, 'En cours', `**${state.current.title}**`, '🎶')] });
  }
};
