const { SlashCommandBuilder } = require('discord.js');
const { info } = require('../utils/embeds');
const { getWhitelist } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Afficher la liste des membres whitelist'),
  async execute(interaction) {
    const wl = getWhitelist();
    const text = wl.length ? wl.map(id => `<@${id}>`).join('\n') : 'Aucun membre whitelist pour le moment.';
    return interaction.reply({ embeds: [info(text)] });
  }
};
