/**
 * Optional native (C++) addon.
 * If not compiled, the bot continues with JS fallbacks (no crash).
 */
let addon = null;

function tryLoad() {
  if (addon) return addon;
  try {
    // node-gyp output
    addon = require('../build/Release/radio_native.node');
    return addon;
  } catch (e1) {
    try {
      // sometimes Debug
      addon = require('../build/Debug/radio_native.node');
      return addon;
    } catch (e2) {
      return null;
    }
  }
}

function normalizeQuery(input) {
  const a = tryLoad();
  if (a && typeof a.normalizeQuery === 'function') {
    try { return a.normalizeQuery(String(input ?? '')); } catch {}
  }
  // JS fallback
  return String(input ?? '').trim().replace(/\s+/g, ' ');
}

module.exports = { tryLoad, normalizeQuery };
