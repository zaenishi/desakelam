/*
 * ============================================================
 * DATABASE.JS — DATA ACCESS LAYER
 * ============================================================
 * Gameplay tidak perlu tahu database yang dipakai.
 * Gameplay hanya berkomunikasi dengan MLDatabase.
 *
 * Saat nanti pindah ke Firebase/Supabase, API file ini
 * dipertahankan agar file gameplay tidak perlu diubah.
 * ============================================================
 */

const MLDatabase = (() => {
  let database = null;
  let databaseReady = false;
  let users = new Map();
  let leaderboard = [];
  let tboards = {}; /* { [tid]: { [uid]: entry } } skor khusus turnamen */

  function readJson(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Cache boleh gagal tanpa menghentikan game. */
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCachedUser() {
    const cachedUser = readJson(DATABASE_CONFIG.cache.user, null);
    if (cachedUser && cachedUser._cacheExpiresAt && cachedUser._cacheExpiresAt < Date.now()) {
      try { localStorage.removeItem(DATABASE_CONFIG.cache.user); } catch (e) {}
    } else if (cachedUser) return cachedUser;

    const legacyUser = readJson(DATABASE_CONFIG.legacy.user, null);
    return legacyUser && typeof legacyUser === 'object' ? legacyUser : null;
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

  function getCachedLeaderboard() {
    const cachedLeaderboard = readJson(DATABASE_CONFIG.cache.leaderboard, null);
    const legacyLeaderboard = readJson(DATABASE_CONFIG.legacy.leaderboard, []);
    const source = Array.isArray(cachedLeaderboard)
      ? cachedLeaderboard
      : (Array.isArray(legacyLeaderboard) ? legacyLeaderboard : []);

    return source.filter(entry => entry && entry.uid).map(normalizeLeaderboardEntry);
  }

  function cacheUser(user) {
    if (!user) return;

    const cached = Object.assign({}, user, { _cacheExpiresAt: Date.now() + (GAME_CONFIG.cache?.profileTtlMs || 2592000000) });
    writeJson(DATABASE_CONFIG.cache.user, cached);
    writeJson(DATABASE_CONFIG.cache.session, { uid: user.uid || '', expiresAt: Date.now() + (GAME_CONFIG.cache?.sessionTtlMs || 2592000000) });

    /* Kompatibilitas dengan versi game lama. */
    writeJson(DATABASE_CONFIG.legacy.user, user);
  }

  function cacheLeaderboard(entries) {
    const cleanEntries = (Array.isArray(entries) ? entries : [])
      .slice()
      .sort((a, b) => (+b.score || 0) - (+a.score || 0))
      .slice(0, GAME_CONFIG.leaderboard.maxEntries);

    writeJson(DATABASE_CONFIG.cache.leaderboard, cleanEntries);
    writeJson(DATABASE_CONFIG.legacy.leaderboard, cleanEntries);
  }

  function openDatabase() {
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
      } catch (error) {
        resolve(null);
        return;
      }

      request.onupgradeneeded = event => {
        const databaseInstance = event.target.result;

        if (!databaseInstance.objectStoreNames.contains(DATABASE_CONFIG.stores.users)) {
          databaseInstance.createObjectStore(
            DATABASE_CONFIG.stores.users,
            { keyPath: 'uid' }
          );
        }

        if (!databaseInstance.objectStoreNames.contains(DATABASE_CONFIG.stores.leaderboard)) {
          databaseInstance.createObjectStore(
            DATABASE_CONFIG.stores.leaderboard,
            { keyPath: 'uid' }
          );
        }

        if (!databaseInstance.objectStoreNames.contains(DATABASE_CONFIG.stores.tournament)) {
          databaseInstance.createObjectStore(
            DATABASE_CONFIG.stores.tournament,
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
        const transaction = database.transaction(storeName, 'readonly');
        const request = transaction.objectStore(storeName).getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      } catch (error) {
        resolve([]);
      }
    });
  }

  function saveToStore(storeName, value) {
    return new Promise(resolve => {
      if (!database) {
        resolve(false);
        return;
      }

      try {
        const transaction = database.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put(clone(value));

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      } catch (error) {
        resolve(false);
      }
    });
  }

  function pruneTournaments() {
    const ids = Object.keys(tboards);
    if (ids.length <= 6) return;
    const newest = id => Math.max(0, ...Object.values(tboards[id]).map(e => e.timestamp || 0));
    ids.sort((x, y) => newest(y) - newest(x)).slice(6).forEach(id => { delete tboards[id]; });
  }

  function persistTournaments() {
    pruneTournaments();
    writeJson(DATABASE_CONFIG.cache.tournament, tboards);
  }

  /* Skor turnamen: hanya naik (best score per pemain per turnamen). */
  async function submitTournamentScore(tid, entry) {
    if (!tid || !entry || !entry.uid) return false;
    const board = tboards[tid] || (tboards[tid] = {});
    const uid = String(entry.uid);
    const normalized = normalizeLeaderboardEntry(entry);
    const old = board[uid];
    if (old && old.score >= normalized.score) return false;
    board[uid] = normalized;
    persistTournaments();
    await saveToStore(DATABASE_CONFIG.stores.tournament, Object.assign({ key: tid + '|' + uid, tid }, normalized));
    return true;
  }

  function getTournamentBoardSync(tid) {
    const board = tboards[tid] || {};
    return Object.values(board)
      .map(e => Object.assign({}, e))
      .sort((a, b) => (b.score - a.score) || (a.timestamp - b.timestamp));
  }

  async function init() {
    const cachedUser = getCachedUser();
    const cachedLeaderboard = getCachedLeaderboard();

    if (cachedUser && cachedUser.uid) {
      users.set(String(cachedUser.uid), clone(cachedUser));
    }

    leaderboard = cachedLeaderboard.slice();
    cacheLeaderboard(leaderboard);

    tboards = readJson(DATABASE_CONFIG.cache.tournament, {}) || {};

    database = await openDatabase();

    if (database) {
      const storedUsers = await readAll(DATABASE_CONFIG.stores.users);
      const storedLeaderboard = await readAll(DATABASE_CONFIG.stores.leaderboard);

      storedUsers.forEach(user => {
        if (user && user.uid) {
          users.set(String(user.uid), user);
        }
      });

      const storedTournament = await readAll(DATABASE_CONFIG.stores.tournament);
      storedTournament.forEach(row => {
        if (!row || !row.tid || !row.uid) return;
        const board = tboards[row.tid] || (tboards[row.tid] = {});
        const old = board[row.uid];
        if (!old || old.score < row.score) board[row.uid] = normalizeLeaderboardEntry(row);
      });
      persistTournaments();

      if (storedLeaderboard.length) {
        leaderboard = storedLeaderboard.filter(entry => entry && entry.uid);
      } else if (leaderboard.length) {
        for (const entry of leaderboard) {
          await saveToStore(DATABASE_CONFIG.stores.leaderboard, entry);
        }
      }

      if (cachedUser && cachedUser.uid && !users.has(String(cachedUser.uid))) {
        await saveToStore(DATABASE_CONFIG.stores.users, cachedUser);
      }

      cacheLeaderboard(leaderboard);

      if (cachedUser && cachedUser.uid && users.has(String(cachedUser.uid))) {
        cacheUser(users.get(String(cachedUser.uid)));
      }
    }

    databaseReady = true;
    return true;
  }

  function getCurrentUser() {
    const session = readJson(DATABASE_CONFIG.cache.session, null);

    if (session && session.uid && (!session.expiresAt || session.expiresAt > Date.now())) {
      return clone(
        users.get(String(session.uid)) || getCachedUser() || {}
      );
    }

    return clone(getCachedUser() || {});
  }

  async function saveUser(user) {
    if (!user || !user.uid) return null;

    users.set(String(user.uid), clone(user));
    cacheUser(user);
    await saveToStore(DATABASE_CONFIG.stores.users, user);

    return clone(user);
  }

  async function createUser(user) {
    return saveUser(user);
  }

  async function getUser(uid) {
    if (!uid) return getCurrentUser();

    const userId = String(uid);

    if (users.has(userId)) {
      return clone(users.get(userId));
    }

    if (database) {
      try {
        const user = await new Promise(resolve => {
          const request = database
            .transaction(DATABASE_CONFIG.stores.users, 'readonly')
            .objectStore(DATABASE_CONFIG.stores.users)
            .get(userId);

          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });

        if (user) {
          users.set(userId, user);
          cacheUser(user);
          return clone(user);
        }
      } catch (error) {
        /* Fallback ke cache. */
      }
    }

    return null;
  }

  async function login(uid) {
    return getUser(uid);
  }

  async function submitScore(entry) {
    if (!entry || !entry.uid) return;

    const normalizedEntry = {
      uid: String(entry.uid),
      name: String(entry.name || '?'),
      characterIndex: Number(entry.characterIndex ?? entry.ch ?? 0),
      score: Number(entry.score || 0),
      kills: Number(entry.kills || 0),
      night: Number(entry.night || 0),
      timestamp: Number(entry.timestamp || entry.t || Date.now())
    };

    const existingEntry = leaderboard.find(
      item => String(item.uid) === normalizedEntry.uid
    );

    if (existingEntry) {
      Object.assign(existingEntry, normalizedEntry);
    } else {
      leaderboard.push(normalizedEntry);
    }

    leaderboard.sort((a, b) => (+b.score || 0) - (+a.score || 0));
    leaderboard = leaderboard.slice(0, GAME_CONFIG.leaderboard.maxEntries);

    cacheLeaderboard(leaderboard);
    await saveToStore(
      DATABASE_CONFIG.stores.leaderboard,
      normalizedEntry
    );
  }

  function getLeaderboardSync() {
    return clone(leaderboard);
  }

  async function getLeaderboard() {
    return getLeaderboardSync();
  }

  return Object.freeze({
    init,
    ready: () => databaseReady,
    getCachedUser,
    getCachedLeaderboard,
    getCurrentUser,
    currentUser: getCurrentUser,
    createUser,
    saveUser,
    getUser,
    login,
    submitScore,
    getLeaderboardSync,
    getLeaderboard,
    submitTournamentScore,
    getTournamentBoardSync,
    config: DATABASE_CONFIG
  });
})();
