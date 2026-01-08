const path = require('node:path');
const { readJson, writeJson } = require('./store');

const OWNERS_FILE = path.join(__dirname, '..', 'data', 'owners.json');
const WL_FILE = path.join(__dirname, '..', 'data', 'whitelist.json');

function getOwners() {
  return readJson(OWNERS_FILE, { owners: [] }).owners;
}

function setOwners(owners) {
  writeJson(OWNERS_FILE, { owners: Array.from(new Set(owners)) });
}

function getWhitelist() {
  return readJson(WL_FILE, { whitelist: [] }).whitelist;
}

function setWhitelist(whitelist) {
  writeJson(WL_FILE, { whitelist: Array.from(new Set(whitelist)) });
}

function isSys(userId, config) {
  return userId === config.SYS_ID;
}

function isOwner(userId) {
  return getOwners().includes(userId);
}

function isWl(userId) {
  return getWhitelist().includes(userId);
}

function canUseMusic(userId, config) {
  if (config?.MUSIC_PUBLIC === true) return true;

  // Otherwise: only SYS, owners and whitelist.
  return isSys(userId, config) || isOwner(userId) || isWl(userId);
}

module.exports = {
  getOwners,
  setOwners,
  getWhitelist,
  setWhitelist,
  isSys,
  canUseMusic
};
