const { SlashCommandBuilder } = require('discord.js');
const { info } = require('../utils/embeds');
const { getOwners } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ownerlist')
    .setDescription('Montrer la liste des owners'),
  async execute(interaction) {
    const owners = getOwners();
    const text = owners.length ? owners.map(id => `<@${id}>`).join('\n') : 'Aucun owner pour le moment.';
    return interaction.reply({ embeds: [info(text)] });
  }
};
