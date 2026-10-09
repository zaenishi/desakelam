/*
 * ============================================================
 * DATABASE.JS — DATA ACCESS LAYER (FIREBASE)
 * ============================================================
 * Gameplay tidak perlu tahu backend yang dipakai.
 * Gameplay hanya berkomunikasi dengan MLDatabase.
 *
 * Backend : Firebase Firestore + Firebase Anonymous Auth
 * Fallback: localStorage cache (game tetap jalan saat offline)
 *
 * Koleksi Firestore:
 *   users/{uid}                        -> profil pemain
 *   leaderboard/{uid}                  -> skor terbaik (global)
 *   tournaments/{tid}/scores/{uid}     -> skor per turnamen
 *   meta/activeTournament              -> tid turnamen aktif
 *
 * API publik tetap sama seperti versi localStorage, jadi
 * file gameplay (account.js, economy.js, tournament.js, dst)
 * TIDAK perlu diubah.
 * ============================================================
 */

/* ===================== KONFIGURASI FIREBASE ===================== */
const ML_FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyC_tyxuMIjDVtf2mYnX9Q84V7MHIMlhxxE",
  authDomain: "desakelam-b87dc.firebaseapp.com",
  projectId: "desakelam-b87dc",
  storageBucket: "desakelam-b87dc.firebasestorage.app",
  messagingSenderId: "760166378302",
  appId: "1:760166378302:web:12c0e0d14da9bb0af21a6f",
  measurementId: "G-4LQXGLQWCT"
});

const ML_FIREBASE_SDK_VERSION = '10.12.0';
const ML_FIREBASE_SDK_BASE = `https://www.gstatic.com/firebasejs/${ML_FIREBASE_SDK_VERSION}`;

/* Nama-nama koleksi Firestore (mudah diganti kalau perlu). */
const ML_COLLECTIONS = Object.freeze({
  users: 'users',
  leaderboard: 'leaderboard',
  tournaments: 'tournaments',
  tournamentScoresSub: 'scores',
  meta: 'meta',
  activeTournamentDoc: 'activeTournament'
});

const MLDatabase = (() => {
  /* ============================================================
   * STATE
   * ============================================================ */
  let appInstance = null;
  let authInstance = null;
  let dbInstance = null;
  let fsApi = null;   /* modular Firestore API */
  let authApi = null; /* modular Auth API */

  let cloudReady = false;
  let databaseReady = false;
  let authUid = null;

  const users = new Map();      /* uid -> user object */
  let leaderboard = [];         /* array of normalized entries */
  let tboards = {};             /* { [tid]: { [uid]: entry } } */

  const unsubs = { leaderboard: null, tournament: null };
  const pullingTids = new Set();
  let activeTid = null;

  /* ============================================================
   * CACHE LOKAL (localStorage) — dipakai sebagai fallback offline
   * ============================================================ */
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
    try { return JSON.parse(JSON.stringify(value)); }
    catch (e) { return value; }
  }

  function getCachedUser() {
    const cachedUser = readJson(DATABASE_CONFIG.cache.user, null);
    if (cachedUser && cachedUser._cacheExpiresAt && cachedUser._cacheExpiresAt < Date.now()) {
      try { localStorage.removeItem(DATABASE_CONFIG.cache.user); } catch (e) {}
    } else if (cachedUser) {
      return cachedUser;
    }

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

    const cached = Object.assign({}, user, {
      _cacheExpiresAt: Date.now() + (GAME_CONFIG.cache?.profileTtlMs || 2592000000)
    });
    writeJson(DATABASE_CONFIG.cache.user, cached);
    writeJson(DATABASE_CONFIG.cache.session, {
      uid: user.uid || '',
      expiresAt: Date.now() + (GAME_CONFIG.cache?.sessionTtlMs || 2592000000)
    });

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

  /* Hapus field internal (berawalan "_") & undefined sebelum kirim ke Firestore. */
  function stripInternal(obj) {
    const out = {};
    if (!obj || typeof obj !== 'object') return out;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('_')) continue;
      const value = obj[key];
      if (value === undefined) continue;
      out[key] = value;
    }
    return out;
  }

  /* ============================================================
   * INISIALISASI FIREBASE
   * ============================================================ */
  async function loadFirebaseModules() {
    const [appMod, authMod, fsMod] = await Promise.all([
      import(`${ML_FIREBASE_SDK_BASE}/firebase-app.js`),
      import(`${ML_FIREBASE_SDK_BASE}/firebase-auth.js`),
      import(`${ML_FIREBASE_SDK_BASE}/firebase-firestore.js`)
    ]);
    return { appMod, authMod, fsMod };
  }

  async function initCloud() {
    try {
      const { appMod, authMod, fsMod } = await loadFirebaseModules();
      authApi = authMod;
      fsApi = fsMod;

      appInstance = (appMod.getApps && appMod.getApps().length)
        ? appMod.getApp()
        : appMod.initializeApp(ML_FIREBASE_CONFIG);

      authInstance = authMod.getAuth(appInstance);

      /* Firestore dengan cache offline persisten + dukungan multi-tab. */
      try {
        dbInstance = fsMod.initializeFirestore(appInstance, {
          localCache: fsMod.persistentLocalCache({
            tabManager: fsMod.persistentMultipleTabManager()
          })
        });
      } catch (error) {
        dbInstance = fsMod.getFirestore(appInstance);
      }

      /* Login anonim — syarat security rules (request.auth != null). */
      if (!authInstance.currentUser) {
        await authMod.signInAnonymously(authInstance);
      }
      authUid = authInstance.currentUser ? authInstance.currentUser.uid : null;

      cloudReady = true;
      console.info('[MLDatabase] Firebase siap. Auth UID:', authUid);
      return true;
    } catch (error) {
      console.warn('[MLDatabase] Firebase tidak tersedia, memakai cache lokal.', error);
      cloudReady = false;
      return false;
    }
  }

  /* ============================================================
   * CLOUD — USERS
   * ============================================================ */
  async function cloudGetUser(uid) {
    if (!cloudReady || !uid) return null;
    try {
      const { doc, getDoc } = fsApi;
      const snap = await getDoc(doc(dbInstance, ML_COLLECTIONS.users, String(uid)));
      if (!snap.exists()) return null;
      const data = stripInternal(snap.data() || {});
      data.uid = String(uid);
      return data;
    } catch (error) {
      console.warn('[MLDatabase] cloudGetUser gagal', error);
      return null;
    }
  }

  async function cloudSaveUser(user) {
    if (!cloudReady || !user || !user.uid) return false;
    try {
      const { doc, setDoc, serverTimestamp } = fsApi;
      const payload = stripInternal(user);
      payload._syncedAt = serverTimestamp();
      await setDoc(
        doc(dbInstance, ML_COLLECTIONS.users, String(user.uid)),
        payload,
        { merge: true }
      );
      return true;
    } catch (error) {
      console.warn('[MLDatabase] cloudSaveUser gagal', error);
      return false;
    }
  }

  /* ============================================================
   * CLOUD — LEADERBOARD
   * ============================================================ */
  async function cloudPullLeaderboard(maxEntries) {
    if (!cloudReady) return [];
    try {
      const { collection, query, orderBy, limit, getDocs } = fsApi;
      const q = query(
        collection(dbInstance, ML_COLLECTIONS.leaderboard),
        orderBy('score', 'desc'),
        limit(maxEntries || GAME_CONFIG.leaderboard.maxEntries)
      );
      const snap = await getDocs(q);
      const rows = [];
      snap.forEach(d => {
        const data = stripInternal(d.data() || {});
        rows.push(normalizeLeaderboardEntry(Object.assign({}, data, { uid: d.id })));
      });
      return rows;
    } catch (error) {
      console.warn('[MLDatabase] cloudPullLeaderboard gagal', error);
      return [];
    }
  }

  async function cloudSubmitScore(entry) {
    if (!cloudReady || !entry || !entry.uid) return false;
    try {
      const { doc, getDoc, setDoc, serverTimestamp } = fsApi;
      const ref = doc(dbInstance, ML_COLLECTIONS.leaderboard, String(entry.uid));

      if (GAME_CONFIG.leaderboard.submitOnlyBestScore) {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const prev = snap.data() || {};
          if (Number(prev.score || 0) >= Number(entry.score || 0)) return false;
        }
      }

      await setDoc(ref, {
        uid: String(entry.uid),
        name: String(entry.name || '?'),
        characterIndex: Number(entry.characterIndex || 0),
        score: Number(entry.score || 0),
        kills: Number(entry.kills || 0),
        night: Number(entry.night || 0),
        timestamp: Number(entry.timestamp || Date.now()),
        _syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.warn('[MLDatabase] cloudSubmitScore gagal', error);
      return false;
    }
  }

  /* ============================================================
   * CLOUD — TOURNAMENT
   * ============================================================ */
  async function cloudGetMeta(docId) {
    if (!cloudReady || !docId) return null;
    try {
      const { doc, getDoc } = fsApi;
      const snap = await getDoc(doc(dbInstance, ML_COLLECTIONS.meta, String(docId)));
      return snap.exists() ? stripInternal(snap.data() || {}) : null;
    } catch (error) {
      return null;
    }
  }

  async function cloudSetMeta(docId, data) {
    if (!cloudReady || !docId) return false;
    try {
      const { doc, setDoc, serverTimestamp } = fsApi;
      await setDoc(
        doc(dbInstance, ML_COLLECTIONS.meta, String(docId)),
        Object.assign({}, stripInternal(data), { _syncedAt: serverTimestamp() }),
        { merge: true }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async function cloudPullTournament(tid) {
    if (!cloudReady || !tid) return null;
    const key = String(tid);
    try {
      const { collection, getDocs } = fsApi;
      const snap = await getDocs(
        collection(
          dbInstance,
          ML_COLLECTIONS.tournaments,
          key,
          ML_COLLECTIONS.tournamentScoresSub
        )
      );
      const board = tboards[key] || (tboards[key] = {});
      snap.forEach(d => {
        const data = stripInternal(d.data() || {});
        const entry = normalizeLeaderboardEntry(Object.assign({}, data, { uid: d.id }));
        const old = board[entry.uid];
        if (!old || Number(old.score || 0) < entry.score) board[entry.uid] = entry;
      });
      persistTournaments();
      return board;
    } catch (error) {
      console.warn('[MLDatabase] cloudPullTournament gagal', error);
      return null;
    }
  }

  async function cloudSubmitTournamentScore(tid, entry) {
    if (!cloudReady || !tid || !entry || !entry.uid) return false;
    const key = String(tid);
    try {
      const { doc, getDoc, setDoc, serverTimestamp } = fsApi;
      const ref = doc(
        dbInstance,
        ML_COLLECTIONS.tournaments,
        key,
        ML_COLLECTIONS.tournamentScoresSub,
        String(entry.uid)
      );

      const snap = await getDoc(ref);
      if (snap.exists()) {
        const prev = snap.data() || {};
        if (Number(prev.score || 0) >= Number(entry.score || 0)) return false;
      }

      await setDoc(ref, {
        uid: String(entry.uid),
        name: String(entry.name || '?'),
        characterIndex: Number(entry.characterIndex || 0),
        score: Number(entry.score || 0),
        kills: Number(entry.kills || 0),
        night: Number(entry.night || 0),
        timestamp: Number(entry.timestamp || Date.now()),
        _syncedAt: serverTimestamp()
      }, { merge: true });

      /* Tandai turnamen ini sebagai yang aktif di meta. */
      await cloudSetMeta(ML_COLLECTIONS.activeTournamentDoc, {
        tid: key,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.warn('[MLDatabase] cloudSubmitTournamentScore gagal', error);
      return false;
    }
  }

  /* ============================================================
   * REALTIME LISTENER (opsional — aktif jika config.realtime.enabled)
   * ============================================================ */
  function startLeaderboardListener() {
    if (!cloudReady || !DATABASE_CONFIG.realtime?.enabled || unsubs.leaderboard) return;
    try {
      const { collection, query, orderBy, limit, onSnapshot } = fsApi;
      const q = query(
        collection(dbInstance, ML_COLLECTIONS.leaderboard),
        orderBy('score', 'desc'),
        limit(GAME_CONFIG.leaderboard.maxEntries)
      );
      unsubs.leaderboard = onSnapshot(q, snap => {
        const rows = [];
        snap.forEach(d => {
          const data = stripInternal(d.data() || {});
          rows.push(normalizeLeaderboardEntry(Object.assign({}, data, { uid: d.id })));
        });
        /* Gabung dengan cache lokal agar skor offline tidak hilang. */
        leaderboard = mergeLeaderboards(rows, leaderboard);
        cacheLeaderboard(leaderboard);
      }, err => console.warn('[MLDatabase] listener leaderboard error', err));
    } catch (error) {
      /* diamkan */
    }
  }

  function startTournamentListener(tid) {
    if (!cloudReady || !DATABASE_CONFIG.realtime?.enabled || !tid) return;
    if (unsubs.tournament) { try { unsubs.tournament(); } catch (e) {} unsubs.tournament = null; }
    try {
      const { collection, onSnapshot } = fsApi;
      const ref = collection(
        dbInstance,
        ML_COLLECTIONS.tournaments,
        String(tid),
        ML_COLLECTIONS.tournamentScoresSub
      );
      unsubs.tournament = onSnapshot(ref, snap => {
        const board = tboards[String(tid)] || (tboards[String(tid)] = {});
        snap.forEach(d => {
          const data = stripInternal(d.data() || {});
          const entry = normalizeLeaderboardEntry(Object.assign({}, data, { uid: d.id }));
          const old = board[entry.uid];
          if (!old || Number(old.score || 0) < entry.score) board[entry.uid] = entry;
        });
        persistTournaments();
      }, err => console.warn('[MLDatabase] listener turnamen error', err));
    } catch (error) {
      /* diamkan */
    }
  }

  function mergeLeaderboards(a, b) {
    const map = new Map();
    [...(a || []), ...(b || [])].forEach(e => {
      if (!e || !e.uid) return;
      const key = String(e.uid);
      const old = map.get(key);
      if (!old || Number(e.score || 0) > Number(old.score || 0)) map.set(key, e);
    });
    return [...map.values()]
      .sort((x, y) => (Number(y.score) || 0) - (Number(x.score) || 0))
      .slice(0, GAME_CONFIG.leaderboard.maxEntries);
  }

  /* ============================================================
   * INIT
   * ============================================================ */
  async function init() {
    /* 1) Muat cache lokal dulu supaya game bisa langsung jalan. */
    const cachedUser = getCachedUser();
    const cachedLeaderboard = getCachedLeaderboard();

    if (cachedUser && cachedUser.uid) {
      users.set(String(cachedUser.uid), clone(cachedUser));
    }
    leaderboard = cachedLeaderboard.slice();
    cacheLeaderboard(leaderboard);

    tboards = readJson(DATABASE_CONFIG.cache.tournament, {}) || {};

    /* 2) Hubungkan ke Firebase. */
    await initCloud();

    /* 3) Sinkronisasi awal dari cloud (kalau tersedia). */
    if (cloudReady) {
      try {
        const cloudLeaderboard = await cloudPullLeaderboard(GAME_CONFIG.leaderboard.maxEntries);
        if (cloudLeaderboard.length) {
          leaderboard = mergeLeaderboards(cloudLeaderboard, leaderboard);
          cacheLeaderboard(leaderboard);
        }

        /* Tarik turnamen yang sedang aktif. */
        const meta = await cloudGetMeta(ML_COLLECTIONS.activeTournamentDoc);
        if (meta && meta.tid) {
          activeTid = String(meta.tid);
          await cloudPullTournament(activeTid);
          startTournamentListener(activeTid);
        }

        /* Sinkronkan user yang sedang login (jika ada di cache). */
        if (cachedUser && cachedUser.uid) {
          const fresh = await cloudGetUser(cachedUser.uid);
          if (fresh) {
            users.set(String(fresh.uid), fresh);
            cacheUser(fresh);
          } else {
            await cloudSaveUser(cachedUser);
          }
        }
      } catch (error) {
        console.warn('[MLDatabase] sinkronisasi awal gagal', error);
      }

      startLeaderboardListener();
    }

    databaseReady = true;
    return true;
  }

  /* Paksa tarik ulang semua data dari cloud (dipanggil manual bila perlu). */
  async function refresh() {
    if (!cloudReady) return false;
    try {
      const cloudLeaderboard = await cloudPullLeaderboard(GAME_CONFIG.leaderboard.maxEntries);
      leaderboard = mergeLeaderboards(cloudLeaderboard, leaderboard);
      cacheLeaderboard(leaderboard);

      const meta = await cloudGetMeta(ML_COLLECTIONS.activeTournamentDoc);
      if (meta && meta.tid) {
        activeTid = String(meta.tid);
        await cloudPullTournament(activeTid);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /* ============================================================
   * PUBLIC API
   * ============================================================ */
  function getCurrentUser() {
    const session = readJson(DATABASE_CONFIG.cache.session, null);

    if (session && session.uid && (!session.expiresAt || session.expiresAt > Date.now())) {
      return clone(users.get(String(session.uid)) || getCachedUser() || {});
    }

    return clone(getCachedUser() || {});
  }

  async function saveUser(user) {
    if (!user || !user.uid) return null;

    users.set(String(user.uid), clone(user));
    cacheUser(user);

    /* Firestore SDK menulis optimistis (langsung resolve, sinkron di background). */
    await cloudSaveUser(user);

    return clone(user);
  }

  async function createUser(user) {
    return saveUser(user);
  }

  async function getUser(uid) {
    if (!uid) return getCurrentUser();

    const userId = String(uid);

    /* Cache lokal dulu. */
    if (users.has(userId)) return clone(users.get(userId));

    /* Kalau tidak ada, coba cloud. */
    const cloudUser = await cloudGetUser(userId);
    if (cloudUser) {
      users.set(userId, cloudUser);
      cacheUser(cloudUser);
      return clone(cloudUser);
    }

    return null;
  }

  async function login(uid) {
    const user = await getUser(uid);
    if (user && user.uid) {
      users.set(String(user.uid), user);
      cacheUser(user);
    }
    return user;
  }

  async function submitScore(entry) {
    if (!entry || !entry.uid) return;

    const normalizedEntry = normalizeLeaderboardEntry(entry);

    /* Update cache lokal. */
    const idx = leaderboard.findIndex(item => String(item.uid) === normalizedEntry.uid);
    const isBetter = idx < 0
      || !GAME_CONFIG.leaderboard.submitOnlyBestScore
      || Number(leaderboard[idx].score || 0) < normalizedEntry.score;

    if (isBetter) {
      if (idx >= 0) leaderboard[idx] = normalizedEntry;
      else leaderboard.push(normalizedEntry);

      leaderboard.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
      leaderboard = leaderboard.slice(0, GAME_CONFIG.leaderboard.maxEntries);
      cacheLeaderboard(leaderboard);
    }

    /* Push ke Firestore. */
    await cloudSubmitScore(normalizedEntry);
  }

  function getLeaderboardSync() {
    return clone(leaderboard);
  }

  async function getLeaderboard() {
    if (cloudReady) {
      const cloudRows = await cloudPullLeaderboard(GAME_CONFIG.leaderboard.maxEntries);
      if (cloudRows.length) {
        leaderboard = mergeLeaderboards(cloudRows, leaderboard);
        cacheLeaderboard(leaderboard);
      }
    }
    return getLeaderboardSync();
  }

  /* Skor turnamen: hanya naik (best score per pemain per turnamen). */
  async function submitTournamentScore(tid, entry) {
    if (!tid || !entry || !entry.uid) return false;
    const key = String(tid);
    const board = tboards[key] || (tboards[key] = {});
    const uid = String(entry.uid);
    const normalized = normalizeLeaderboardEntry(entry);

    const old = board[uid];
    const improvedLocal = !old || Number(old.score || 0) < normalized.score;

    if (improvedLocal) {
      board[uid] = normalized;
      persistTournaments();
    }

    const okCloud = await cloudSubmitTournamentScore(key, normalized);
    return improvedLocal || okCloud;
  }

  function getTournamentBoardSync(tid) {
    if (!tid) return [];
    const key = String(tid);
    const board = tboards[key] || {};

    /* Kalau belum ada lokal, tarik dari cloud di background. */
    if (!Object.keys(board).length && cloudReady && !pullingTids.has(key)) {
      pullingTids.add(key);
      cloudPullTournament(key).finally(() => pullingTids.delete(key));
    }

    return Object.values(board)
      .map(e => Object.assign({}, e))
      .sort((a, b) => (b.score - a.score) || (a.timestamp - b.timestamp));
  }

  /* Helper opsional untuk komponen yang butuh akses mentah Firebase. */
  function getFirebaseHandles() {
    return { app: appInstance, auth: authInstance, db: dbInstance, uid: authUid, ready: cloudReady };
  }

  return Object.freeze({
    init,
    refresh,
    ready: () => databaseReady,
    cloudReady: () => cloudReady,
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
    firebase: getFirebaseHandles,
    config: DATABASE_CONFIG
  });
})();
