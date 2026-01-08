const { SlashCommandBuilder } = require('discord.js');
const { okRadio, errRadio, infoRadio } = require('../utils/embeds');
const { safeEdit } = require("../utils/respond");
const { checkMusicPerm, getVoiceChannel } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Fait rejoindre le bot dans la vocal'),

  async execute(interaction, client, config) {
    // Répond immédiatement pour éviter "Unknown interaction"
    const can = checkMusicPerm(interaction.user.id, config);
    const channel = getVoiceChannel(interaction);

    if (!can) {
      return interaction.reply({
        embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")],
        ephemeral: true
      }).catch(() => {});
    }

    if (!channel) {
      return interaction.reply({
        embeds: [errRadio(interaction, 'Aucun salon vocal', "Tu dois être dans un salon vocal.")],
        ephemeral: true
      }).catch(() => {});
    }

    // ACK tout de suite
    const replied = await interaction.reply({ embeds: [infoRadio(interaction, 'Connexion…', 'Connexion à la vocal en cours.', '⏳')] }).then(() => true).catch(() => false);

    try {
      await client.player.join(channel);

      if (replied) {
        return safeEdit(interaction, { embeds: [okRadio(interaction, 'Radio connectée', 'La radio a bien rejoint le salon vocal.', '👋')] }).catch(() => {});
      }
      // fallback si reply a échoué (interaction expirée)
      return;
    } catch (e) {
      console.error(e);
      if (replied) {
        return safeEdit(interaction, { embeds: [errRadio(interaction, 'Connexion impossible', "Impossible de rejoindre la vocal.")] }).catch(() => {});
      }
      return;
    }
  }
};
