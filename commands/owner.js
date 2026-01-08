const { SlashCommandBuilder } = require('discord.js');
const { okRadio, errRadio } = require('../utils/embeds');
const { getOwners, setOwners, isSys } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Définir un membre owner du bot (SYS uniquement)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à ajouter').setRequired(true)),
  async execute(interaction, client, config) {
    if (!isSys(interaction.user.id, config)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Accès refusé', "SYS uniquement.")], ephemeral: true }).catch(() => {});
    }
    const user = interaction.options.getUser('membre', true);
    const owners = getOwners();
    if (owners.includes(user.id)) {
      return interaction.reply({ embeds: [errRadio(interaction, 'Déjà owner', `${user} est déjà owner.`)], ephemeral: true }).catch(() => {});
    }
    owners.push(user.id);
    setOwners(owners);
    return interaction.reply({ embeds: [okRadio(interaction, 'Owner ajouté', `${user} est maintenant **owner**.`, '👑')] }).catch(() => {});
  }
};
