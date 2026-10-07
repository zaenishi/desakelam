/*
 * ============================================================
 * DATABASE.JS — PROVIDER-AGNOSTIC DATA ACCESS LAYER
 * ============================================================
 *
 * Gameplay TIDAK boleh membaca localStorage/IndexedDB langsung.
 * Semua akses data melewati MLDatabase.
 *
 * Provider saat ini:
 *   IndexedDB + localStorage cache
 *
 * Provider berikutnya:
 *   Supabase / Firebase dapat diimplementasikan di layer ini
 *   tanpa mengubah account.js, tournament.js, atau gameplay.
 * ============================================================
 */

const MLDatabase = (() => {
  let database = null;
  let databaseReady = false;
  let users = new Map();
  let leaderboard = [];
  let activeProvider = DATABASE_CONFIG.provider;
  let remoteProvider = null;

  const clone = value => {
    if (value === undefined || value === null) return value;
    try { return JSON.parse(JSON.stringify(value)); }
    catch { return value; }
  };

  const readCache = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.value !== undefined && parsed.expiresAt) {
        if (parsed.expiresAt > Date.now()) return parsed.value;
        localStorage.removeItem(key);
        return fallback;
      }
      return parsed;
    } catch {
      return fallback;
    }
  };

  const writeCache = (key, value, ttlMs = 0) => {
    try {
      const payload = ttlMs > 0
        ? { value, cachedAt: Date.now(), expiresAt: Date.now() + ttlMs }
        : value;
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {}
  };

  const removeCache = key => {
    try { localStorage.removeItem(key); } catch {}
  };

  function normalizeUser(user = {}) {
    const stats = user.stats || user.st || {};
    return {
      ...user,
      uid: String(user.uid || ''),
      name: String(user.name || '').trim(),
      characterIndex: Number(user.characterIndex ?? user.ch ?? 0),
      bestScore: Number(user.bestScore ?? user.best ?? 0),
      gamesPlayed: Number(user.gamesPlayed ?? user.games ?? 0),
      stats: { ...stats },
      achievements: Array.isArray(user.achievements)
        ? [...user.achievements]
        : (Array.isArray(user.ach) ? [...user.ach] : []),
      accessCode: String(user.accessCode || user.code || ''),
      skinUnlocked: Number(user.skinUnlocked ?? user.skin ?? 0),
      updatedAt: Number(user.updatedAt || Date.now())
    };
  }

  function normalizeLeaderboardEntry(entry = {}) {
    return {
      uid: String(entry.uid || ''),
      name: String(entry.name || '?'),
      characterIndex: Number(entry.characterIndex ?? entry.ch ?? 0),
      score: Number(entry.score || 0),
      kills: Number(entry.kills || 0),
      night: Number(entry.night || 0),
      timestamp: Number(entry.timestamp ?? entry.t ?? Date.now()),
      updatedAt: Number(entry.updatedAt || Date.now())
    };
  }

  function readCachedUser() {
    const cached = readCache(
      DATABASE_CONFIG.cache.user,
      null
    );

    if (cached && cached.uid) return normalizeUser(cached);

    const legacy = readLegacyUser();
    return legacy ? normalizeUser(legacy) : null;
  }

  function readLegacyUser() {
    try {
      const raw = localStorage.getItem(DATABASE_CONFIG.legacy.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function readCachedLeaderboard() {
    const cached = readCache(
      DATABASE_CONFIG.cache.leaderboard,
      null
    );

    const legacy = (() => {
      try {
        const raw = localStorage.getItem(DATABASE_CONFIG.legacy.leaderboard);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const source = Array.isArray(cached)
      ? cached
      : (Array.isArray(legacy) ? legacy : []);

    return source
      .filter(entry => entry && entry.uid)
      .map(normalizeLeaderboardEntry);
  }

  function cacheUser(user) {
    if (!user || !user.uid) return;
    const normalized = normalizeUser(user);
    writeCache(
      DATABASE_CONFIG.cache.user,
      normalized,
      GAME_CONFIG.cache.profileTtlMs
    );
    writeCache(
      DATABASE_CONFIG.cache.session,
      {
        uid: normalized.uid,
        loggedInAt: Date.now()
      },
      GAME_CONFIG.cache.sessionTtlMs
    );

    // Legacy migration/compatibility.
    try {
      localStorage.setItem(
        DATABASE_CONFIG.legacy.user,
        JSON.stringify(normalized)
      );
    } catch {}
  }

  function cacheLeaderboard(entries) {
    const cleanEntries = (Array.isArray(entries) ? entries : [])
      .filter(entry => entry && entry.uid)
      .map(normalizeLeaderboardEntry)
      .sort((a, b) => b.score - a.score)
      .slice(0, GAME_CONFIG.leaderboard.maxEntries);

    writeCache(
      DATABASE_CONFIG.cache.leaderboard,
      cleanEntries,
      GAME_CONFIG.cache.leaderboardTtlMs
    );

    try {
      localStorage.setItem(
        DATABASE_CONFIG.legacy.leaderboard,
        JSON.stringify(cleanEntries)
      );
    } catch {}
  }

  function getSession() {
    return readCache(DATABASE_CONFIG.cache.session, null);
  }

  function hasActiveSession() {
    const session = getSession();
    return !!(session && session.uid);
  }

  function clearSession() {
    removeCache(DATABASE_CONFIG.cache.session);
  }

  function openIndexedDb() {
    return new Promise(resolve => {
      if (!('indexedDB' in window)) {
        resolve(null);
        return;
      }

      let request;
      try {
        request = indexedDB.open(
          DATABASE_CONFIG.name,
          DATABASE_CONFIG.version
        );
      } catch {
        resolve(null);
        return;
      }

      request.onupgradeneeded = event => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(DATABASE_CONFIG.stores.users)) {
          db.createObjectStore(
            DATABASE_CONFIG.stores.users,
            { keyPath: 'uid' }
          );
        }

        if (!db.objectStoreNames.contains(DATABASE_CONFIG.stores.leaderboard)) {
          db.createObjectStore(
            DATABASE_CONFIG.stores.leaderboard,
            { keyPath: 'uid' }
          );
        }

        if (!db.objectStoreNames.contains(DATABASE_CONFIG.stores.metadata)) {
          db.createObjectStore(
            DATABASE_CONFIG.stores.metadata,
            { keyPath: 'key' }
          );
        }
      };

      request.onsuccess = event => resolve(event.target.result);
      request.onerror = () => resolve(null);
    });
  }

  function readAll(storeName) {
    return new Promise(resolve => {
      if (!database) {
        resolve([]);
        return;
      }

      try {
        const tx = database.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  function getFromStore(storeName, key) {
    return new Promise(resolve => {
      if (!database) {
        resolve(null);
        return;
      }

      try {
        const request = database
          .transaction(storeName, 'readonly')
          .objectStore(storeName)
          .get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  function putToStore(storeName, value) {
    return new Promise(resolve => {
      if (!database) {
        resolve(false);
        return;
      }

      try {
        const tx = database.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(clone(value));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  function createRemoteProvider() {
    if (activeProvider === 'supabase') {
      if (typeof SupabaseDatabaseProvider === 'undefined') {
        throw new Error('Supabase provider belum dimuat.');
      }

      return new SupabaseDatabaseProvider(
        DATABASE_CONFIG.remote.supabase
      );
    }

    /*
     * Firebase dapat ditambahkan dengan kontrak provider yang sama.
     */
    if (activeProvider === 'firebase') {
      throw new Error(
        'Firebase provider belum dipasang. Gunakan adapter provider yang sama seperti Supabase.'
      );
    }

    return null;
  }

  async function init() {
    const cachedUser = readCachedUser();
    const cachedLeaderboard = readCachedLeaderboard();

    users.clear();
    leaderboard = cachedLeaderboard.slice();

    if (cachedUser && cachedUser.uid) {
      users.set(cachedUser.uid, cachedUser);
    }

    database = activeProvider === 'indexeddb'
      ? await openIndexedDb()
      : null;

    remoteProvider = null;

    if (activeProvider !== 'indexeddb') {
      try {
        remoteProvider = createRemoteProvider();
        await remoteProvider.init();

        const remoteLeaderboard =
          await remoteProvider.getLeaderboard();

        if (Array.isArray(remoteLeaderboard)) {
          leaderboard = remoteLeaderboard
            .filter(entry => entry && entry.uid)
            .map(normalizeLeaderboardEntry);
        }

        if (
          typeof remoteProvider.subscribeLeaderboard === 'function'
        ) {
          remoteProvider.subscribeLeaderboard(entries => {
            if (!Array.isArray(entries)) return;

            leaderboard = entries
              .filter(entry => entry && entry.uid)
              .map(normalizeLeaderboardEntry)
              .sort((a, b) => b.score - a.score)
              .slice(0, GAME_CONFIG.leaderboard.maxEntries);

            cacheLeaderboard(leaderboard);
          });
        }
      } catch (error) {
        if (GAME_CONFIG.app.debug) {
          console.warn('[MLDatabase] Remote provider gagal:', error);
        }

        remoteProvider = null;
      }
    }

    if (database) {
      const storedUsers = await readAll(DATABASE_CONFIG.stores.users);
      const storedLeaderboard = await readAll(DATABASE_CONFIG.stores.leaderboard);

      storedUsers.forEach(user => {
        const normalized = normalizeUser(user);
        if (normalized.uid) users.set(normalized.uid, normalized);
      });

      if (storedLeaderboard.length) {
        leaderboard = storedLeaderboard
          .filter(entry => entry && entry.uid)
          .map(normalizeLeaderboardEntry);
      }

      if (cachedUser && cachedUser.uid && !users.has(cachedUser.uid)) {
        await putToStore(DATABASE_CONFIG.stores.users, cachedUser);
      }

      cacheLeaderboard(leaderboard);

      const current = cachedUser && users.get(cachedUser.uid);
      if (current) cacheUser(current);
    }

    databaseReady = true;
    return true;
  }

  function getCurrentUser() {
    const session = getSession();

    if (session && session.uid) {
      return clone(
        users.get(String(session.uid)) ||
        readCachedUser() ||
        {}
      );
    }

    return clone(readCachedUser() || {});
  }

  async function saveUser(user) {
    const normalized = normalizeUser(user);
    if (!normalized.uid) return null;

    normalized.updatedAt = Date.now();
    users.set(normalized.uid, normalized);
    cacheUser(normalized);

    if (database && activeProvider === 'indexeddb') {
      await putToStore(
        DATABASE_CONFIG.stores.users,
        normalized
      );
    }

    if (remoteProvider) {
      try {
        await remoteProvider.saveUser(normalized);
      } catch (error) {
        if (GAME_CONFIG.app.debug) {
          console.warn('[MLDatabase] Gagal menyimpan user remote:', error);
        }
      }
    }

    return clone(normalized);
  }

  async function getUser(uid) {
    const userId = String(uid || '');
    if (!userId) return getCurrentUser();

    if (users.has(userId)) {
      return clone(users.get(userId));
    }

    if (remoteProvider) {
      try {
        const user = await remoteProvider.getUser(userId);

        if (user) {
          const normalized = normalizeUser(user);
          users.set(userId, normalized);
          cacheUser(normalized);
          return clone(normalized);
        }
      } catch (error) {
        if (GAME_CONFIG.app.debug) {
          console.warn('[MLDatabase] Gagal mengambil user remote:', error);
        }
      }
    }

    if (database && activeProvider === 'indexeddb') {
      const user = await getFromStore(
        DATABASE_CONFIG.stores.users,
        userId
      );

      if (user) {
        const normalized = normalizeUser(user);
        users.set(userId, normalized);
        cacheUser(normalized);
        return clone(normalized);
      }
    }

    const cached = readCachedUser();
    return cached && cached.uid === userId ? clone(cached) : null;
  }

  async function createUser(user) {
    return saveUser(user);
  }

  async function login(uid) {
    return getUser(uid);
  }

  async function submitScore(entry) {
    const normalized = normalizeLeaderboardEntry(entry);
    if (!normalized.uid) return null;

    const existingIndex = leaderboard.findIndex(
      item => item.uid === normalized.uid
    );

    if (existingIndex >= 0) {
      const existing = leaderboard[existingIndex];

      /*
       * Best-score mode mencegah skor lama yang lebih tinggi
       * tertimpa skor sesi yang lebih rendah.
       */
      if (GAME_CONFIG.leaderboard.submitOnlyBestScore) {
        normalized.score = Math.max(
          Number(existing.score || 0),
          Number(normalized.score || 0)
        );
      }

      leaderboard[existingIndex] = {
        ...existing,
        ...normalized,
        updatedAt: Date.now()
      };
    } else {
      leaderboard.push(normalized);
    }

    leaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, GAME_CONFIG.leaderboard.maxEntries);

    cacheLeaderboard(leaderboard);

    if (database && activeProvider === 'indexeddb') {
      await putToStore(
        DATABASE_CONFIG.stores.leaderboard,
        leaderboard.find(item => item.uid === normalized.uid)
      );
    }

    if (remoteProvider) {
      try {
        await remoteProvider.submitScore(
          leaderboard.find(item => item.uid === normalized.uid)
        );
      } catch (error) {
        if (GAME_CONFIG.app.debug) {
          console.warn('[MLDatabase] Gagal mengirim skor remote:', error);
        }
      }
    }

    return clone(normalized);
  }

  function getLeaderboardSync() {
    return clone(leaderboard);
  }

  async function getLeaderboard() {
    if (remoteProvider) {
      try {
        const remoteEntries =
          await remoteProvider.getLeaderboard();

        if (Array.isArray(remoteEntries)) {
          leaderboard = remoteEntries
            .filter(entry => entry && entry.uid)
            .map(normalizeLeaderboardEntry)
            .sort((a, b) => b.score - a.score)
            .slice(0, GAME_CONFIG.leaderboard.maxEntries);

          cacheLeaderboard(leaderboard);
        }
      } catch (error) {
        if (GAME_CONFIG.app.debug) {
          console.warn('[MLDatabase] Gagal mengambil leaderboard remote:', error);
        }
      }
    }

    return getLeaderboardSync();
  }

  /*
   * Titik migrasi realtime.
   *
   * Supabase/Firebase adapter nanti cukup mengimplementasikan:
   *   init()
   *   getUser(uid)
   *   saveUser(user)
   *   submitScore(entry)
   *   getLeaderboard()
   *   subscribeLeaderboard(callback)
   *
   * Gameplay tidak perlu mengetahui detail provider.
   */
  async function setProvider(providerName) {
    const allowed = ['indexeddb', 'supabase', 'firebase'];
    if (!allowed.includes(providerName)) {
      throw new Error(`Database provider tidak didukung: ${providerName}`);
    }

    activeProvider = providerName;
    databaseReady = false;
    remoteProvider = null;
    return init();
  }

  return Object.freeze({
    init,
    ready: () => databaseReady,
    provider: () => activeProvider,

    getCachedUser: readCachedUser,
    getCachedLeaderboard: readCachedLeaderboard,
    getCurrentUser,
    currentUser: getCurrentUser,
    hasActiveSession,
    clearSession,

    createUser,
    saveUser,
    getUser,
    login,

    submitScore,
    getLeaderboardSync,
    getLeaderboard,

    setProvider,
    config: DATABASE_CONFIG
  });
})();
