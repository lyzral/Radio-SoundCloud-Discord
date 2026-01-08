const { LavalinkManager } = require('lavalink-client');
const scdl = require('soundcloud-downloader').default;

// --- Helpers
function isSoundCloudUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'soundcloud.com' || u.hostname.endsWith('.soundcloud.com') || u.hostname === 'on.soundcloud.com';
  } catch {
    return false;
  }
}

/**
 * Lavalink wrapper that keeps the old API used by commands:
 * join/leave/play/next/stop/skip/getState + isSoundCloudUrl
 */
function createVoiceManager(client) {
  let manager;

  // local view (for /queue, /now, etc.)
  const state = new Map(); // guildId => { current, queue: [] }

  function ensureState(guildId) {
    if (!state.has(guildId)) state.set(guildId, { current: null, queue: [] });
    return state.get(guildId);
  }

  // --- Queue helpers (lavalink-client queue shape can vary by version)
  function getQueueLength(player) {
    const q = player?.queue;
    if (!q) return 0;
    if (typeof q.size === 'number') return q.size;
    if (Array.isArray(q.tracks)) return q.tracks.length;
    if (Array.isArray(q)) return q.length;
    if (typeof q.length === 'number') return q.length;
    return 0;
  }

  function clearQueue(player) {
    const q = player?.queue;
    if (!q) return;
    try {
      if (typeof q.clear === 'function') return q.clear();
    } catch {}
    try {
      if (Array.isArray(q.tracks)) q.tracks.length = 0;
    } catch {}
    try {
      if (Array.isArray(q)) q.length = 0;
    } catch {}
  }

  function addTrackFront(player, track) {
    const q = player?.queue;
    if (!q) return false;

    // Preferred API on many lavalink-client versions: queue.add(track, index)
    if (typeof q.add === 'function') {
      try { q.add(track, 0); return true; } catch {}
      // Some implementations expect (index, track)
      try { q.add(0, track); return true; } catch {}
    }

    // Some implementations expose tracks array
    if (Array.isArray(q.tracks)) {
      q.tracks.unshift(track);
      return true;
    }

    // Fallback if queue itself is an array
    if (Array.isArray(q)) {
      q.unshift(track);
      return true;
    }

    return false;
  }

  function ensureManager() {
    if (manager) return manager;

    const cfg = client?.config?.LAVALINK || require('../config.js').LAVALINK;
    const host = cfg?.host || '127.0.0.1';
    const port = Number(cfg?.port) || 2333;
    const password = cfg?.password || cfg?.authorization || 'youshallnotpass';
    const secure = false; // force HTTP; avoids lavalink-client forcing port 443

    manager = new LavalinkManager({
      nodes: [
        {
          id: 'main',
          host,
          port,
          authorization: password,
          secure
        }
      ],

      // how to send voice payloads to Discord
      sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild?.shard) return guild.shard.send(payload);
        return client.ws.send(payload);
      },

      // optional: auto-resume session
      client: {
        id: client.user?.id || '0',
        username: client.user?.username || 'Radio'
      }
    });

    // forward raw events
    client.on('raw', (d) => {
      try { manager.sendRawData(d); } catch {}
    });

    // keep our local state in sync
    manager.on('trackStart', (player, track) => {
      const st = ensureState(player.guildId);
      // Our local queue should represent *upcoming* tracks only.
      // When a track starts, remove the first queued entry (the one that just became current)
      // to avoid duplicates in /queue.
      if (Array.isArray(st.queue) && st.queue.length > 0) st.queue.shift();
      st.current = track;
    });
    manager.on('queueEnd', (player) => {
      const st = ensureState(player.guildId);
      st.current = null;
      st.queue = [];
    });
    manager.on('trackEnd', (player) => {
      const st = ensureState(player.guildId);
      // queue will be updated when we add/remove. if empty => current null
      if (!player.queue?.current) st.current = null;
    });

    return manager;
  }

  client.once('ready', async () => {
    // store config on client for ensureManager()
    client.config = client.config || require('../config.js');
    const m = ensureManager();
    try {
      await m.init({
        // lavalink-client expects a userId for handshake
        clientId: client.user.id
      });
    } catch (e) {
      console.error('[lavalink] init error:', e);
    }
  });

  async function getInfo(url) {
    try {
      const info = await scdl.getInfo(url);
      return {
        title: info?.title || 'Titre inconnu',
        url
      };
    } catch {
      return { title: 'Titre inconnu', url };
    }
  }

  async function connectAndGetPlayer(voiceChannel, textChannelId) {
    const m = ensureManager();
    const player = m.createPlayer({
      guildId: voiceChannel.guild.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: textChannelId,
      selfDeaf: true,
      volume: 100
    });

    if (!player.connected) {
      await player.connect();
    }
    return player;
  }

  return {
    isSoundCloudUrl,

    async join(voiceChannel) {
      await connectAndGetPlayer(voiceChannel, null);
      return true;
    },

    leave(guildId) {
      const m = ensureManager();
      const player = m.players.get(guildId);
      if (player) {
        try { player.destroy(); } catch {}
      }
      state.delete(guildId);
    },

    getState(guildId) {
      const st = state.get(guildId);
      if (!st) return { connected: false, queue: [], current: null };

      const m = ensureManager();
      const player = m.players.get(guildId);
      const connected = !!player && !!player.connected;

      return {
        connected,
        queue: Array.isArray(st.queue) ? [...st.queue] : [],
        current: st.current ? { title: st.current.title || st.current.info?.title || 'Titre inconnu' } : null
      };
    },

    async play(voiceChannel, url, requestedBy) {
      if (!isSoundCloudUrl(url)) throw new Error('SOUNDCLOUD_ONLY');

      const player = await connectAndGetPlayer(voiceChannel, voiceChannel.guild.systemChannelId || null);

      // Lavalink can load direct URLs. We restrict to SoundCloud URLs only.
      const res = await player.search(url, { requester: requestedBy });
      const track = res?.tracks?.[0];
      if (!track) throw new Error('NO_RESULTS');

      player.queue.add(track);

      // update local queue for /queue
      const info = await getInfo(url);
      const st = ensureState(voiceChannel.guild.id);
      st.queue.push({ title: info.title, url, requestedById: requestedBy?.id || null });

      if (!player.playing && !player.paused) {
        await player.play();
      }

      return { title: track.info?.title || info.title, url };
    },

    async next(voiceChannel, url, requestedBy) {
      if (!isSoundCloudUrl(url)) throw new Error('SOUNDCLOUD_ONLY');
      const player = await connectAndGetPlayer(voiceChannel, voiceChannel.guild.systemChannelId || null);

      const res = await player.search(url, { requester: requestedBy });
      const track = res?.tracks?.[0];
      if (!track) throw new Error('NO_RESULTS');

      // Put as next: insert at the front of the internal queue.
      // (Queue shape differs depending on lavalink-client version)
      const inserted = addTrackFront(player, track);
      if (!inserted) throw new Error('QUEUE_INSERT_NOT_SUPPORTED');

      const info = await getInfo(url);
      const st = ensureState(voiceChannel.guild.id);
      st.queue.unshift({ title: info.title, url, requestedById: requestedBy?.id || null });

      if (!player.playing && !player.paused) {
        await player.play();
      }

      return { title: track.info?.title || info.title, url };
    },

    stop: async function (guildId) {
      const m = ensureManager();
      const player = m.players.get(guildId);
      if (!player) return 'no_player';

      // Disable any repeat modes if supported (best-effort, API differs across versions)
      try { if (typeof player.setRepeatMode === 'function') player.setRepeatMode(0); } catch {}
      try { if (typeof player.setTrackRepeat === 'function') player.setTrackRepeat(false); } catch {}
      try { if (typeof player.setQueueRepeat === 'function') player.setQueueRepeat(false); } catch {}
      try { if ('trackRepeat' in player) player.trackRepeat = false; } catch {}
      try { if ('queueRepeat' in player) player.queueRepeat = false; } catch {}

      // IMPORTANT: clear queue BEFORE stopping so Lavalink doesn't instantly start the next track.
      clearQueue(player);

      // Some lavalink-client versions keep a "current" reference in the queue.
      // Best-effort reset to avoid auto-resume.
      try { if (player.queue && 'current' in player.queue) player.queue.current = null; } catch {}
      try { if (player.queue && Array.isArray(player.queue.previous)) player.queue.previous.length = 0; } catch {}

      try { player.setPaused(false); } catch {}
      try {
        const res = player.stop();
        if (res && typeof res.then === 'function') await res;
      } catch {}

      const st = ensureState(guildId);
      st.current = null;
      st.queue = [];

      return 'stopped';
    },

    skip(guildId) {
      const m = ensureManager();
      const player = m.players.get(guildId);
      if (!player) return 'stopped';

      const nextLen = getQueueLength(player);
      if (nextLen <= 0) {
        try { player.setPaused(false); } catch {}
        try { player.stop(); } catch {}
        clearQueue(player);
        const st = ensureState(guildId);
        st.current = null;
        st.queue = [];
        return 'stopped';
      }

      try {
        player.skip();
        return 'skipped';
      } catch (e) {
        // Some lavalink-client versions throw when skipping past the queue size.
        try { player.setPaused(false); } catch {}
        try { player.stop(); } catch {}
        clearQueue(player);
        const st = ensureState(guildId);
        st.current = null;
        st.queue = [];
        return 'stopped';
      }
    }
  };
}

module.exports = { createVoiceManager };
