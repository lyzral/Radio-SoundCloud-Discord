const { SlashCommandBuilder } = require('discord.js');
const { safeEdit } = require("../utils/respond");
const { okRadio, errRadio, infoRadio } = require('../utils/embeds');
const { normalizeQuery } = require('../utils/nativeAddon');
const { checkMusicPerm, getVoiceChannel, isSoundCloudUrl } = require('./_musicCommon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Définir la prochaine musique (SoundCloud uniquement)')
    .addStringOption(opt => opt.setName('recherche').setDescription('Lien SoundCloud').setRequired(true)),

  async execute(interaction, client, config) {
    if (!checkMusicPerm(interaction.user.id, config)) {
      return interaction.reply({
        embeds: [errRadio(interaction, 'Accès refusé', "Tu n'as pas la permission d'utiliser les commandes musique.")],
        ephemeral: true
      }).catch(() => {});
    }

    const channel = getVoiceChannel(interaction);
    if (!channel) {
      return interaction.reply({
        embeds: [errRadio(interaction, 'Aucun salon vocal', 'Tu dois être dans un salon vocal.')],
        ephemeral: true
      }).catch(() => {});
    }

    await interaction.deferReply();
    await safeEdit(interaction, { embeds: [infoRadio(interaction, 'Préparation…', 'Définition de la prochaine musique en cours.', '⏳')] }).catch(() => {});

    const query = normalizeQuery(interaction.options.getString('recherche', true));
    if (!isSoundCloudUrl(query)) {
      return safeEdit(interaction, {
        embeds: [errRadio(interaction, 'Lien invalide', 'SoundCloud uniquement : mets un lien SoundCloud (soundcloud.com / on.soundcloud.com).', '🚫')]
      }).catch(() => {});
    }

    try {
      const track = await client.player.next(channel, query, interaction.user);
      return safeEdit(interaction, {
        embeds: [okRadio(interaction, 'Prochaine musique définie', `**${track.title}**`, '⏭️')]
      }).catch(() => {});
    } catch (e) {
      console.error(e);
      return safeEdit(interaction, {
        embeds: [errRadio(interaction, 'Erreur', 'Impossible de définir la prochaine musique (vérifie le lien).')]
      }).catch(() => {});
    }
  }
};
