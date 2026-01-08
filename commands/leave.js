
const { SlashCommandBuilder } = require('discord.js');
const { safeEdit } = require("../utils/respond");
const { okRadio, errRadio } = require('../utils/embeds');
const { checkMusicPerm } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Fait quitter le bot'),
  async execute(interaction, client, config) {
    if (!checkMusicPerm(interaction.user.id, config)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")], ephemeral: true }).catch(() => {});
    }

    await interaction.deferReply();

    try {
      client.player.leave(interaction.guildId);
      return safeEdit(interaction, { embeds: [okRadio(interaction, 'Radio déconnectée', 'La radio a quitté le salon vocal.', '👋')] });
    } catch (e) {
      console.error(e);
      return safeEdit(interaction, { embeds: [errRadio(interaction, 'Erreur', "Impossible de quitter la vocal.")] });
    }
  }
};
