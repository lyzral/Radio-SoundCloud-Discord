
const { SlashCommandBuilder } = require('discord.js');
const { safeEdit } = require("../utils/respond");
const { okRadio, errRadio, infoRadio } = require('../utils/embeds');
const { checkMusicPerm } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stopper la musique et vider la file'),
  async execute(interaction, client, config) {
    if (!checkMusicPerm(interaction.user.id, config)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")], ephemeral: true }).catch(() => {});
    }

    await interaction.deferReply();

    // Feedback immédiat
    await safeEdit(interaction, { embeds: [infoRadio(interaction, 'Arrêt…', 'Arrêt de la lecture en cours.', '⏳')] }).catch(() => {});

    const result = await client.player.stop(interaction.guildId);
    if (result === 'no_player') {
      return safeEdit(interaction, { embeds: [errRadio(interaction, 'Rien à arrêter', "Aucune lecture en cours.")] }).catch(() => {});
    }
    return safeEdit(interaction, { embeds: [okRadio(interaction, 'Lecture arrêtée', 'La musique a été stoppée et la file vidée.', '🛑')] }).catch(() => {});
  }
};
