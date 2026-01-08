
const { SlashCommandBuilder } = require('discord.js');
const { safeEdit } = require("../utils/respond");
const { okRadio, errRadio } = require('../utils/embeds');
const { checkMusicPerm } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passer à la musique suivante'),
  async execute(interaction, client, config) {
    if (!checkMusicPerm(interaction.user.id, config)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")], ephemeral: true }).catch(() => {});
    }

    await interaction.deferReply();
    const res = client.player.skip(interaction.guildId);
    if (res === 'stopped') {
      return safeEdit(interaction, { embeds: [okRadio(interaction, 'Lecture stoppée', "Il n'y a aucune musique après : la lecture a été stoppée.", '🛑')] });
    }
    return safeEdit(interaction, { embeds: [okRadio(interaction, 'Musique suivante', 'Passage à la musique suivante.', '⏭️')] });
  }
};
