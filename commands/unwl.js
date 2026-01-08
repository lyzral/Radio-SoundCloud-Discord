const { SlashCommandBuilder } = require('discord.js');
const { ok, err } = require('../utils/embeds');
const { getWhitelist, setWhitelist, isSys } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwl')
    .setDescription('Enlever un membre de la whitelist (SYS uniquement)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à retirer').setRequired(true)),
  async execute(interaction, client, config) {
    if (!isSys(interaction.user.id, config)) {
      return interaction.reply({ embeds: [err("Tu n'as pas la permission (SYS uniquement).")], ephemeral: true });
    }
    const user = interaction.options.getUser('membre', true);
    const wl = getWhitelist();
    const next = wl.filter(id => id !== user.id);
    if (next.length === wl.length) {
      return interaction.reply({ embeds: [err(`${user} n'est pas whitelist.`)], ephemeral: true });
    }
    setWhitelist(next);
    return interaction.reply({ embeds: [ok(`${user} n'est plus **whitelist**.`)] });
  }
};
