
const { canUseMusic } = require('../utils/permissions');
const { getMemberVoiceChannel } = require('../utils/voice');

function checkMusicPerm(userId, config) {
  return canUseMusic(userId, config);
}

function getVoiceChannel(interaction) {
  return getMemberVoiceChannel(interaction);
}

function isSoundCloudUrl(input) {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    return host === 'soundcloud.com' || host.endsWith('.soundcloud.com') || host === 'on.soundcloud.com';
  } catch {
    return false;
  }
}

module.exports = { checkMusicPerm, getVoiceChannel, isSoundCloudUrl };
