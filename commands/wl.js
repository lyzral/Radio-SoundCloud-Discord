const { SlashCommandBuilder } = require('discord.js');
const { ok, err } = require('../utils/embeds');
const { getWhitelist, setWhitelist, isSys } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wl')
    .setDescription('Mettre un membre whitelist (SYS uniquement)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à ajouter').setRequired(true)),
  async execute(interaction, client, config) {
    if (!isSys(interaction.user.id, config)) {
      return interaction.reply({ embeds: [err("Tu n'as pas la permission (SYS uniquement).")], ephemeral: true });
    }
    const user = interaction.options.getUser('membre', true);
    const wl = getWhitelist();
    if (wl.includes(user.id)) {
      return interaction.reply({ embeds: [err(`${user} est déjà whitelist.`)], ephemeral: true });
    }
    wl.push(user.id);
    setWhitelist(wl);
    return interaction.reply({ embeds: [ok(`${user} est maintenant **whitelist**.`)] });
  }
};
