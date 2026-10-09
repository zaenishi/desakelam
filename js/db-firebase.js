/*
 * ============================================================
 * DB-FIREBASE.JS — ADAPTER REMOTE FIRESTORE
 * ============================================================
 * Dipakai oleh MLDatabase bila DATABASE_CONFIG.provider === 'firebase'.
 * Struktur koleksi:
 *   users/{uid}                      profil pemain (cadangan)
 *   leaderboard/{uid}                skor terbaik umum
 *   tournaments/{tid}/scores/{uid}   skor khusus turnamen (hanya naik)
 * Antarmuka adapter (semua mengembalikan Promise kecuali subscribe*):
 *   connect, saveUser, getUser, submitScore, fetchLeaderboard, subscribeLeaderboard,
 *   submitTournamentScore, fetchTournament, subscribeTournament
 * Untuk menambah backend lain (Supabase dsb.), buat objek dengan antarmuka yang sama.
 */
const FirebaseRemote = (() => {
  let db = null;
  const cfg = () => (typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : {});
  const safeId = v => String(v).replace(/[\/\s]/g, '_');
  const plain = o => JSON.parse(JSON.stringify(o));

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Gagal memuat ' + src));
      document.head.appendChild(s);
    });
  }

  async function connect() {
    const c = cfg();
    if (!c.apiKey || !c.projectId) throw new Error('FIREBASE_CONFIG belum diisi (apiKey / projectId)');
    if (!window.firebase) {
      const base = c.sdkBaseUrl || `https://www.gstatic.com/firebasejs/${c.sdkVersion || '10.12.2'}/`;
      await loadScript(base + 'firebase-app-compat.js');
      await loadScript(base + 'firebase-firestore-compat.js');
      if (c.useAnonymousAuth) await loadScript(base + 'firebase-auth-compat.js');
    }
    const fb = window.firebase;
    const sdkConfig = { apiKey: c.apiKey, authDomain: c.authDomain, projectId: c.projectId, storageBucket: c.storageBucket, messagingSenderId: c.messagingSenderId, appId: c.appId };
    const app = fb.apps && fb.apps.length ? fb.app() : fb.initializeApp(sdkConfig);
    if (c.useAnonymousAuth) await fb.auth().signInAnonymously();
    db = fb.firestore(app);
    return true;
  }

  const users = () => db.collection('users');
  const board = () => db.collection('leaderboard');
  const scores = tid => db.collection('tournaments').doc(safeId(tid)).collection('scores');

  return {
    name: 'firebase',
    connect,
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
