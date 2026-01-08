const { SlashCommandBuilder } = require('discord.js');
const { ok, err } = require('../utils/embeds');
const { getOwners, setOwners, isSys } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unowner')
    .setDescription('Enlever un membre owner (SYS uniquement)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à retirer').setRequired(true)),
  async execute(interaction, client, config) {
    if (!isSys(interaction.user.id, config)) {
      return interaction.reply({ embeds: [err("Tu n'as pas la permission (SYS uniquement).")], ephemeral: true });
    }
    const user = interaction.options.getUser('membre', true);
    const owners = getOwners();
    const next = owners.filter(id => id !== user.id);
    if (next.length === owners.length) {
      return interaction.reply({ embeds: [err(`${user} n'est pas owner.`)], ephemeral: true });
    }
    setOwners(next);
    return interaction.reply({ embeds: [ok(`${user} n'est plus **owner**.`)] });
  }
};
