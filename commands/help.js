const { SlashCommandBuilder } = require('discord.js');
const { radioEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche toutes les commandes et leur fonctionnement'),
  async execute(interaction, client, config) {
    const access =
      (config?.MUSIC_PUBLIC === true)
        ? 'Public'
        : 'Réservé au **SYS**, aux **owners** et à la **whitelist**';

    const embed = radioEmbed(interaction, {
      emoji: '📖',
      title: 'Aide — Commandes',
      description: [
        'Voici toutes les commandes disponibles pour la radio SoundCloud.',
        '',
        `🔐 **Accès musique :** ${access}`,
        '',
        '💡 **Astuce :** utilise `/play` avec un lien SoundCloud.'
      ].join('\n'),
      kind: 'neutral'
    })
      .addFields(
        {
          name: '🔊 Vocal',
          value: [
            '`/join` — Rejoint ta vocal',
            '`/leave` — Quitte la vocal'
          ].join('\n'),
          inline: true
        },
        {
          name: '🎵 Lecture',
          value: [
            '`/play <recherche|lien>` — Lance une musique',
            '`/stop` — Stoppe et vide la file',
            '`/skip` — Passe à la suivante (ou stop si pas de suivante)',
            '`/now` — Affiche le titre en cours'
          ].join('\n'),
          inline: true
        },
        {
          name: '📜 File d’attente',
          value: [
            '`/queue` — Affiche la file',
            '`/next <recherche|lien>` — Définit la prochaine musique'
          ].join('\n'),
          inline: true
        },
        {
          name: '🛡️ Gestion des accès',
          value: [
            '`/owner <membre>` — Ajoute un owner',
            '`/unowner <membre>` — Retire un owner',
            '`/ownerlist` — Liste les owners',
            '`/wl <membre>` — Ajoute à la whitelist',
            '`/unwl <membre>` — Retire de la whitelist',
            '`/whitelist` — Liste la whitelist'
          ].join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'Radio • SoundCloud' });

    return interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
