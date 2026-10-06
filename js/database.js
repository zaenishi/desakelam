/*
 * ============================================================
 * DATABASE.JS — DATA ACCESS LAYER
 * ============================================================
 * Gameplay TIDAK berkomunikasi langsung dengan IndexedDB /
 * Firebase / Supabase. Semuanya lewat MLDatabase.
 *
 * Cara migrasi:
 *  1. Isi credential di DATABASE_CONFIG.supabase / .firebase
 *  2. Ubah DATABASE_CONFIG.provider ke 'supabase' / 'firebase'
 *  3. Implement provider-nya di bawah (createSupabaseProvider dll)
 *  4. File gameplay TIDAK PERLU DIUBAH.
 * ============================================================
 */

const MLDatabase = (() => {
  /* ---------- State internal ---------- */
  let provider = null;
  let databaseReady = false;
  let users = new Map();
  let leaderboard = [];

  /* ---------- Helper cache (localStorage) ---------- */
  function readJson(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* cache boleh gagal */ }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /* ---------- Normalisasi data ---------- */
  function normalizeUserProfile(raw = {}) {
    return {
      name: String(raw.name || ''),
      uid: String(raw.uid || ''),
      characterIndex: Number(raw.characterIndex ?? raw.ch ?? 0),
      bestScore: Number(raw.bestScore ?? raw.best ?? 0),
      gamesPlayed: Number(raw.gamesPlayed ?? raw.games ?? 0),
      stats: raw.stats || raw.st || {},
      achievements: Array.isArray(raw.achievements) ? raw.achievements
                    : Array.isArray(raw.ach) ? raw.ach : [],
      accessCode: String(raw.accessCode || raw.code || ''),
      skinUnlocked: Number(raw.skinUnlocked ?? raw.skin ?? 0)
    };
  }

  function normalizeLeaderboardEntry(entry) {
    return {
      uid: String(entry.uid || ''),
      name: String(entry.name || '?'),
      characterIndex: Number(entry.characterIndex ?? entry.ch ?? 0),
      score: Number(entry.score || 0),
      kills: Number(entry.kills || 0),
      night: Number(entry.night || 0),
      timestamp: Number(entry.timestamp ?? entry.t ?? Date.now())
    };
  }

  /* ============================================================
   * PROVIDER: LOCAL (IndexedDB + localStorage)
   * ============================================================ */
  function createLocalProvider() {
    let db = null;

    function open() {
      return new Promise(resolve => {
        if (!('indexedDB' in window)) return resolve(null);
        let req;
        try { req = indexedDB.open(DATABASE_CONFIG.name, DATABASE_CONFIG.version); }
        catch { return resolve(null); }

        req.onupgradeneeded = event => {
          const inst = event.target.result;
          if (!inst.objectStoreNames.contains(DATABASE_CONFIG.stores.users))
            inst.createObjectStore(DATABASE_CONFIG.stores.users, { keyPath: 'uid' });
          if (!inst.objectStoreNames.contains(DATABASE_CONFIG.stores.leaderboard))
            inst.createObjectStore(DATABASE_CONFIG.stores.leaderboard, { keyPath: 'uid' });
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = () => resolve(null);
      });
    }

    function readAll(store) {
      return new Promise(resolve => {
        if (!db) return resolve([]);
        try {
          const tx = db.transaction(store, 'readonly');
          const r = tx.objectStore(store).getAll();
          r.onsuccess = () => resolve(r.result || []);
          r.onerror = () => resolve([]);
        } catch { resolve([]); }
      });
    }

    function put(store, value) {
      return new Promise(resolve => {
        if (!db) return resolve(false);
        try {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).put(clone(value));
          tx.oncomplete = () => resolve(true);
          tx.onerror = tx.onabort = () => resolve(false);
        } catch { resolve(false); }
      });
    }

    return {
      name: 'local',
      async init() { db = await open(); return true; },
      async loadUsers()        { return db ? readAll(DATABASE_CONFIG.stores.users) : []; },
      async loadLeaderboard()  { return db ? readAll(DATABASE_CONFIG.stores.leaderboard) : []; },
      async saveUser(u)        { return put(DATABASE_CONFIG.stores.users, u); },
      async saveScore(e)       { return put(DATABASE_CONFIG.stores.leaderboard, e); }
    };
  }

  /* ============================================================
   * PROVIDER: SUPABASE (stub — isi saat migrasi)
   * ============================================================ */
  function createSupabaseProvider() {
    return {
      name: 'supabase',
      async init() {
        if (!DATABASE_CONFIG.supabase.url)
          throw new Error('Supabase URL belum diisi di DATABASE_CONFIG');
        // TODO: import { createClient } from '@supabase/supabase-js'
        // const { createClient } = window.supabase;
        // this.client = createClient(url, anonKey);
        console.warn('[MLDatabase] Supabase provider belum diimplementasikan.');
        return false;
      },
      async loadUsers()       { return []; },
      async loadLeaderboard() { return []; },
      async saveUser(u)       { /* TODO */ return false; },
      async saveScore(e)      { /* TODO */ return false; }
    };
  }

  /* ============================================================
   * PROVIDER: FIREBASE (stub — isi saat migrasi)
   * ============================================================ */
  function createFirebaseProvider() {
    return {
      name: 'firebase',
      async init() {
        if (!DATABASE_CONFIG.firebase.projectId)
          throw new Error('Firebase config belum diisi');
        console.warn('[MLDatabase] Firebase provider belum diimplementasikan.');
        return false;
      },
      async loadUsers()       { return []; },
      async loadLeaderboard() { return []; },
      async saveUser(u)       { return false; },
      async saveScore(e)      { return false; }
    };
  }

  function createProvider() {
    switch (DATABASE_CONFIG.provider) {
      case 'supabase': return createSupabaseProvider();
      case 'firebase': return createFirebaseProvider();
      default:         return createLocalProvider();
    }
  }

  /* ---------- Cache helpers ---------- */
  function getCachedUser() {
    const cached = readJson(DATABASE_CONFIG.cache.user, null);
    if (cached) return cached;
    const legacy = readJson(DATABASE_CONFIG.legacy.user, null);
    return legacy && typeof legacy === 'object' ? legacy : null;
  }

  function getCachedLeaderboard() {
    const cached = readJson(DATABASE_CONFIG.cache.leaderboard, null);
    const legacy = readJson(DATABASE_CONFIG.legacy.leaderboard, []);
    const source = Array.isArray(cached) ? cached
                 : Array.isArray(legacy) ? legacy : [];
    return source.filter(e => e && e.uid).map(normalizeLeaderboardEntry);
  }

  function cacheUser(user) {
    if (!user) return;
    writeJson(DATABASE_CONFIG.cache.user, user);
    writeJson(DATABASE_CONFIG.cache.session, { uid: user.uid || '' });
    writeJson(DATABASE_CONFIG.legacy.user, user);
  }

  function cacheLeaderboard(entries) {
    const clean = (Array.isArray(entries) ? entries : [])
      .slice()
      .sort((a, b) => (+b.score || 0) - (+a.score || 0))
      .slice(0, GAME_CONFIG.leaderboard.maxEntries);
    writeJson(DATABASE_CONFIG.cache.leaderboard, clean);
    writeJson(DATABASE_CONFIG.legacy.leaderboard, clean);
  }

  /* ---------- Public API ---------- */
  async function init() {
    /* 1) Muat dari cache lokal dulu (offline-first) */
    const cachedUser = getCachedUser();
    const cachedLb   = getCachedLeaderboard();
    if (cachedUser && cachedUser.uid) users.set(String(cachedUser.uid), clone(cachedUser));
    leaderboard = cachedLb.slice();

    /* 2) Init provider */
    provider = createProvider();
    try { await provider.init(); }
    catch (err) { console.warn('[MLDatabase] provider gagal:', err); }

    /* 3) Muat dari provider */
    try {
      const storedUsers = await provider.loadUsers();
      const storedLb    = await provider.loadLeaderboard();
      storedUsers.forEach(u => { if (u && u.uid) users.set(String(u.uid), u); });
      if (storedLb.length) leaderboard = storedLb.filter(e => e && e.uid);
      else if (leaderboard.length) {
        for (const e of leaderboard) await provider.saveScore(e);
      }
    } catch (err) {
      console.warn('[MLDatabase] gagal muat provider:', err);
    }

    cacheLeaderboard(leaderboard);
    if (cachedUser && cachedUser.uid && users.has(String(cachedUser.uid)))
      cacheUser(users.get(String(cachedUser.uid)));

    databaseReady = true;
    return true;
  }

  function getCurrentUser() {
    const session = readJson(DATABASE_CONFIG.cache.session, null);
    if (session && session.uid)
      return clone(users.get(String(session.uid)) || getCachedUser() || {});
    return clone(getCachedUser() || {});
  }

  async function saveUser(user) {
    if (!user || !user.uid) return null;
    users.set(String(user.uid), clone(user));
    cacheUser(user);
    if (provider) await provider.saveUser(user);
    return clone(user);
  }

  async function getUser(uid) {
    if (!uid) return getCurrentUser();
    const id = String(uid);
    if (users.has(id)) return clone(users.get(id));
    return null;
  }

  async function submitScore(entry) {
    if (!entry || !entry.uid) return;
    const normalized = normalizeLeaderboardEntry(entry);
    const existing = leaderboard.find(i => String(i.uid) === normalized.uid);
    if (existing) Object.assign(existing, normalized);
    else leaderboard.push(normalized);

    leaderboard.sort((a, b) => (+b.score || 0) - (+a.score || 0));
    leaderboard = leaderboard.slice(0, GAME_CONFIG.leaderboard.maxEntries);
    cacheLeaderboard(leaderboard);
    if (provider) await provider.saveScore(normalized);
  }

  function getLeaderboardSync() { return clone(leaderboard); }
  async function getLeaderboard() { return getLeaderboardSync(); }

  return Object.freeze({
    init,
    ready: () => databaseReady,
    getCachedUser,
    getCachedLeaderboard,
    getCurrentUser,
    saveUser,
    getUser,
    login: getUser,
    createUser: saveUser,
    submitScore,
    getLeaderboardSync,
    getLeaderboard,
    normalizeUserProfile,
    normalizeLeaderboardEntry,
    config: DATABASE_CONFIG,
    providerName: () => provider ? provider.name : 'unknown'
  });
})();