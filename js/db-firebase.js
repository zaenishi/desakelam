/*
 * ============================================================
 * DB-FIREBASE.JS — ADAPTER REMOTE FIRESTORE
 * ============================================================
 * Dipakai MLDatabase bila DATABASE_CONFIG.provider === 'firebase'.
 * Koleksi:
 *   users/{uid}                      cadangan profil pemain
 *   leaderboard/{uid}                skor terbaik umum
 *   tournaments/{tid}/scores/{uid}   skor khusus turnamen (hanya naik)
 * connect() dijalankan bertahap dan setiap langkah dicatat (getSteps()) beserta
 * petunjuk perbaikan -> tampil di Setelan → "Tes Koneksi" agar mudah mendiagnosis.
 */
const FirebaseRemote = (() => {
  let db = null, steps = [];
  const cfg = () => (typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : {});
  const safeId = v => String(v).replace(/[\/\s]/g, '_');
  const plain = o => JSON.parse(JSON.stringify(o));
  const timeout = (p, ms) => Ms(p, ms);
  function Ms(promise, ms) {
    if (!ms) return promise;
    return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout ' + ms + ' ms'), { code: 'timeout' })), ms))]);
  }

  function hintFor(stepName, e) {
    const code = String((e && e.code) || ''), msg = String((e && e.message) || '');
    if (stepName === 'config') return 'Isi apiKey dan projectId pada FIREBASE_CONFIG di js/config.js.';
    if (stepName === 'sdk') return 'SDK Firebase tidak bisa dimuat. Periksa internet / jaringan yang memblokir gstatic.com, atau isi FIREBASE_CONFIG.sdkBaseUrl dengan SDK yang di-host sendiri.';
    if (stepName === 'auth') return 'Login anonim gagal. Aktifkan Firebase Console → Authentication → Sign-in method → Anonymous, atau set useAnonymousAuth:false dan pakai rules tanpa login.';
    if (stepName === 'firestore') {
      if (/permission/i.test(code) || /insufficient permissions|has not been used|disabled/i.test(msg))
        return 'Firestore menolak akses atau API belum aktif. Publish rules (lihat FIREBASE_SETUP.md; untuk uji: allow read, write: if true) dan pastikan Cloud Firestore API aktif. Jika rules mensyaratkan login, set useAnonymousAuth:true.';
      if (/not-found/i.test(code) || /does not exist/i.test(msg))
        return 'Database Firestore belum dibuat. Firebase Console → Build → Firestore Database → Create database.';
      return 'Server Firestore tidak terjangkau (' + (code || 'timeout') + '). Penyebab umum: (1) Firestore Database belum dibuat / API belum aktif, (2) jaringan atau ad-blocker memblokir *.googleapis.com, (3) halaman dibuka lewat file:// — gunakan hosting http(s). Coba juga FIREBASE_CONFIG.forceLongPolling:true.';
    }
    return '';
  }
  async function step(name, label, fn, ms) {
    const t0 = performance.now(), row = { name, label, ok: false, ms: 0, error: '', hint: '' };
    steps.push(row);
    try { const r = await Ms(Promise.resolve().then(fn), ms); row.ok = true; return r; }
    catch (e) {
      row.error = ((e && e.code) ? e.code + ': ' : '') + ((e && e.message) || e);
      row.hint = hintFor(name, e);
      const err = new Error(label + ' gagal — ' + row.error); err.hint = row.hint; err.code = e && e.code;
      throw err;
    } finally { row.ms = Math.round(performance.now() - t0); }
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = () => { s.remove(); reject(new Error('Gagal memuat ' + src)); };
      document.head.appendChild(s);
    });
  }
  async function loadSdk(c) {
    if (window.firebase && window.firebase.firestore) return;
    const names = ['firebase-app-compat.js', 'firebase-firestore-compat.js'].concat(c.useAnonymousAuth ? ['firebase-auth-compat.js'] : []);
    const v = c.sdkVersion || '10.12.2';
    const bases = c.sdkBaseUrl ? [c.sdkBaseUrl] : [`https://www.gstatic.com/firebasejs/${v}/`, `https://cdn.jsdelivr.net/npm/firebase@${v}/`];
    let lastErr;
    for (const base of bases) {
      try { for (const n of names) { if (!(window.firebase && ((n.includes('app') && window.firebase.app) || (n.includes('firestore') && window.firebase.firestore) || (n.includes('auth') && window.firebase.auth)))) await loadScript(base + n); } return; }
      catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('SDK tidak dapat dimuat');
  }

  async function connect() {
    steps = [];
    const c = cfg();
    await step('config', 'Cek konfigurasi', () => { if (!c.apiKey || !c.projectId) throw new Error('FIREBASE_CONFIG belum diisi (apiKey / projectId)'); }, 0);
    await step('sdk', 'Muat Firebase SDK', () => loadSdk(c), 20000);
    await step('init', 'Inisialisasi aplikasi', () => {
      const fb = window.firebase;
      const sdkConfig = { apiKey: c.apiKey, authDomain: c.authDomain, projectId: c.projectId, storageBucket: c.storageBucket, messagingSenderId: c.messagingSenderId, appId: c.appId };
      const app = fb.apps && fb.apps.length ? fb.app() : fb.initializeApp(sdkConfig);
      db = fb.firestore(app);
      /* long-polling otomatis: jauh lebih andal di jaringan seluler / sekolah / proxy */
      try { db.settings(c.forceLongPolling ? { experimentalForceLongPolling: true, ignoreUndefinedProperties: true } : { experimentalAutoDetectLongPolling: true, ignoreUndefinedProperties: true }); } catch (e) { /* sudah dipakai sebelumnya */ }
    }, 0);
    if (c.useAnonymousAuth) await step('auth', 'Login anonim', () => window.firebase.auth().signInAnonymously(), 15000);
    await step('firestore', 'Hubungi Firestore', () => db.collection('leaderboard').limit(1).get(), c.connectTimeoutMs || 20000);
    return true;
  }

  const users = () => db.collection('users');
  const board = () => db.collection('leaderboard');
  const scores = tid => db.collection('tournaments').doc(safeId(tid)).collection('scores');

  return {
    name: 'firebase',
    connect,
    getSteps: () => steps.map(s => Object.assign({}, s)),
    saveUser: user => users().doc(safeId(user.uid)).set(plain(user), { merge: true }),
    async getUser(uid) { const s = await users().doc(safeId(uid)).get(); return s.exists ? s.data() : null; },
    submitScore: entry => board().doc(safeId(entry.uid)).set(plain(entry), { merge: true }),
    async fetchLeaderboard(limit) { const s = await board().orderBy('score', 'desc').limit(limit).get(); return s.docs.map(d => d.data()); },
    subscribeLeaderboard(cb, limit = 300) {
      return board().orderBy('score', 'desc').limit(limit).onSnapshot(s => cb(s.docs.map(d => d.data())), e => console.warn('[firebase] leaderboard:', e.message));
    },
    /* Skor turnamen hanya boleh naik: dijalankan dalam transaksi. */
    submitTournamentScore(tid, entry) {
      const ref = scores(tid).doc(safeId(entry.uid));
      return db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (snap.exists && (snap.data().score || 0) >= entry.score) return;
        tx.set(ref, plain(entry));
      });
    },
    async fetchTournament(tid) { const s = await scores(tid).get(); return s.docs.map(d => d.data()); },
    subscribeTournament(tid, cb) {
      return scores(tid).onSnapshot(s => cb(s.docs.map(d => d.data())), e => console.warn('[firebase] tournament:', e.message));
    }
  };
})();
