function getMemberVoiceChannel(interaction) {
  const member = interaction.member;
  const channel = member?.voice?.channel;
  return channel || null;
}

function sameVoice(interaction) {
  const memberChannel = getMemberVoiceChannel(interaction);
  const botChannel = interaction.guild?.members?.me?.voice?.channel;
  if (!botChannel) return true;
  return memberChannel && botChannel.id === memberChannel.id;
}

module.exports = { getMemberVoiceChannel, sameVoice };
