/*
 * ============================================================
 * CONFIG.JS — PUSAT PENGATURAN GAME
 * ============================================================
 * Semua pengaturan yang biasa diubah panitia / developer ada di sini.
 * Tidak perlu menyentuh file gameplay untuk mengatur turnamen.
 *
 * ---- CARA ATUR TURNAMEN (GAME_CONFIG.tournament) ----
 *  active        : true / false. false = mode turnamen mati total (tombol hanya "START").
 *  mode          : "time"    -> jendela waktu harian jam startTime s/d endTime (jam lokal perangkat)
 *                  "date"    -> turnamen berakhir pada tanggal+jam targetDate
 *                  "session" -> (tambahan, cocok untuk uji coba) timer dimulai saat START pertama
 *                               dan berjalan selama durationMinutes
 *  startTime     : "HH:MM"  (mode time)
 *  endTime       : "HH:MM"  (mode time)
 *  targetDate    : "YYYY-MM-DDTHH:mm:ss" (mode date, jam lokal)
 *  durationMinutes: durasi turnamen dalam menit (mode session)
 *
 * Contoh uji cepat (3 menit):  mode: "session", durationMinutes: 3
 * ============================================================
 */

const GAME_CONFIG = Object.freeze({
  app: {
    name: 'Malam Kelam di Desa Terkutuk',
    version: '5.0.0',
    environment: 'production',
    debug: false
  },
  name: 'Malam Kelam di Desa Terkutuk',
  canvas: { width: 960, height: 540 },
  world: { width: 2400, height: 1600 },
  leaderboard: { maxEntries: 300, displayEntries: 50, submitOnlyBestScore: true },
  gameplay: {
    maxMonsters: 30,
    autosaveSeconds: 10,
    pauseWhenHidden: true,
    skillCooldownMultiplier: 1
  },
  registration: {
    minNameLength: 2,
    maxNameLength: 12,
    allowedNamePattern: /[^A-Za-z0-9 ]/g,
    uppercaseName: true
  },
  cache: {
    profileTtlMs: 30 * 24 * 60 * 60 * 1000,
    leaderboardTtlMs: 5 * 60 * 1000,
    sessionTtlMs: 30 * 24 * 60 * 60 * 1000
  },
  ui: {
    autoFullscreen: true,
    autoLandscape: true,
    showCredits: true,
    credits: ['@zaenishi', '@kawan-kawan-labkom']
  },

  /* ===================== TURNAMEN ===================== */
  tournament: {
    active: true,                       // boolean
    mode: 'time',                       // "time" | "date" | "session"
    startTime: '08:00',                 // mode time
    endTime: '16:00',                   // mode time
    targetDate: '2026-10-10T16:00:00',  // mode date
    durationMinutes: 10,                // mode session

    /* pengaturan tambahan (opsional diubah) */
    warningMinutes: 1,                  // peringatan "sisa waktu" sebelum berakhir
    finalCountdownSeconds: 10,          // hitung mundur dramatis di detik terakhir
    topWinners: 3,                      // jumlah juara yang diumumkan
    winnerRevealMs: 2400,               // jeda antar pengumuman juara
    lockLeaderboard: true               // sembunyikan leaderboard selama turnamen
  },
  accessCodeRequired: true,             // wajib kode akses sebelum daftar

  /* ===================== SESI KARAKTER ===================== */
  session: {
    lockCharacter: true                 // karakter terkunci setelah dipilih (sampai sesi di-reset)
  },

  /* ===================== EDUSHOP ===================== */
  shop: {
    availableDuringTournament: true,
    quiz: {
      timeLimitSeconds: 30,             // waktu per soal
      coinsPerCorrect: 25,              // koin per jawaban benar
      streakEvery: 3,                   // bonus tiap N jawaban benar beruntun
      streakBonus: 15
    }
  }
});

/*
 * ============================================================
 * PINDAH DATABASE KE FIREBASE (3 langkah)
 * ============================================================
 *  1. Buat project Firebase + Firestore (lihat FIREBASE_SETUP.md).
 *  2. Salin nilai "firebaseConfig" dari Firebase Console ke FIREBASE_CONFIG di bawah.
 *  3. Ubah DATABASE_CONFIG.provider dari 'indexeddb' menjadi 'firebase'.
 * Selesai. Kode gameplay tidak perlu diubah. Jika Firebase gagal terhubung
 * (offline / config salah), game otomatis memakai database lokal.
 * Untuk kembali ke lokal: ubah provider kembali ke 'indexeddb'.
 */
const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  useAnonymousAuth: false,   // true bila Firestore rules Anda mensyaratkan login anonim
  sdkVersion: '10.12.2',     // versi Firebase JS SDK (compat) yang dimuat dari CDN
  sdkBaseUrl: ''             // opsional: alamat SDK self-host bila CDN diblokir jaringan sekolah
};

const DATABASE_CONFIG = Object.freeze({
  provider: 'indexeddb',      // 'indexeddb' (lokal) | 'firebase'
  remoteTimeoutMs: 7000,      // batas waktu menunggu Firebase saat start
  name: 'malam_kelam_db',
  version: 3,
  stores: {
    users: 'users',
    leaderboard: 'leaderboard',
    metadata: 'metadata',
    tournament: 'tournament'
  },
  cache: {
    user: 'ml_cache_user',
    leaderboard: 'ml_cache_leaderboard',
    session: 'ml_session',
    tournament: 'ml_cache_tboards',
    prefix: 'ml:v3:'
  },
  remote: {
    supabase: { url: '', anonKey: '', usersTable: 'users', leaderboardTable: 'leaderboard' }
  },
  legacy: { user: 'ml_me', leaderboard: 'ml_lb2', skin: 'ml_skin' }
});

/* Kode akses turnamen. Tambahkan kode baru di array ini jika diperlukan. */
const ACCESS_CODES = Object.freeze(['TURNAMEN26', 'LEGENDA26', 'MALAM2026', 'LAB2024']);

/*
 * Semua karakter ada di sini. Setiap karakter punya:
 *  - statistik (hp/speed/damage multiplier, cooldown skill)
 *  - attack  : tipe serangan dasar (slash, cleave, stab, arrow, bolt, holy)
 *  - skill   : ditangani js/skills.js berdasarkan id
 *  - weapon  : teks preview senjata di layar pilih karakter
 */
const CHARACTER_CLASSES = Object.freeze([
  { id: 'kn', name: 'Ksatria Pedang', role: 'Tank · Area Damage', emoji: '🛡️', color: '#5a6a8a', accent: '#88ccff',
    hpMultiplier: 1.25, speedMultiplier: .95, damageMultiplier: 1, skillCooldown: 7,
    skillName: 'Shield Bash', description: 'Kebal 2 detik + hantaman area yang membuat monster terhuyung.',
    weapon: { name: 'Pedang Ksatria', desc: 'Tebasan lebar 180° mengenai semua sampah di depanmu.' },
    attack: { type: 'slash', cooldown: .36, stamina: 8, damage: 12, hits: 1, range: 85, arc: Math.PI / 2 } },
  { id: 'ma', name: 'Penyihir Elemen', role: 'Sihir · Stun Monster', emoji: '🔮', color: '#7a3a9a', accent: '#cc66ff',
    hpMultiplier: .9, speedMultiplier: 1, damageMultiplier: 1, skillCooldown: 8,
    skillName: 'Arcane Blast', description: 'Ledakan area besar yang MEMBEKUKAN (stun) monster sampah 2 detik.',
    weapon: { name: 'Tongkat Elemen', desc: 'Bola api & es bergantian; bola es membuat musuh stun sesaat.' },
    attack: { type: 'bolt', cooldown: .5, stamina: 8, damage: 13, hits: 1, range: 420, splash: 55 } },
  { id: 'ar', name: 'Pemanah Cepat', role: 'Jarak Jauh · Speed Tinggi', emoji: '🏹', color: '#3a6a3a', accent: '#88ff88',
    hpMultiplier: 1, speedMultiplier: 1.18, damageMultiplier: .95, skillCooldown: 5,
    skillName: 'Multi Shot', description: 'Lima panah menembus beruntun dalam bentuk kipas.',
    weapon: { name: 'Busur Angin', desc: 'Panah cepat menembus satu musuh, jangkauan sangat jauh.' },
    attack: { type: 'arrow', cooldown: .32, stamina: 6, damage: 10, hits: 1, range: 440, pierce: 1 } },
  { id: 'ro', name: 'Bayangan Pembasmi', role: 'Assassin · Kritis', emoji: '🗡️', color: '#6a2a2a', accent: '#ff6666',
    hpMultiplier: .9, speedMultiplier: 1.15, damageMultiplier: 1.1, skillCooldown: 7,
    skillName: 'Shadow Strike', description: 'Teleport ke musuh terdekat + serangan kritis.',
    weapon: { name: 'Belati Kembar', desc: 'Dua tusukan kilat per serangan, jarak pendek, sangat cepat.' },
    attack: { type: 'stab', cooldown: .24, stamina: 6, damage: 6, hits: 2, range: 62, arc: Math.PI / 3 } },
  { id: 'pr', name: 'Pendeta Cahaya', role: 'Support · Penyembuh', emoji: '✨', color: '#a89a3a', accent: '#ffffdd',
    hpMultiplier: 1.1, speedMultiplier: 1, damageMultiplier: .9, skillCooldown: 10,
    skillName: 'Holy Heal', description: 'Menyembuhkan 35 HP + sanity dan menyilaukan sampah di sekitar.',
    weapon: { name: 'Tongkat Surya', desc: 'Bola cahaya mengejar musuh & menyembuhkanmu sedikit.' },
    attack: { type: 'holy', cooldown: .42, stamina: 7, damage: 10, hits: 1, range: 380 } },
  { id: 'be', name: 'Pendekar Amuk', role: 'Brawler · Damage Besar', emoji: '⚔️', color: '#a4501a', accent: '#ffaa66',
    hpMultiplier: 1.15, speedMultiplier: 1, damageMultiplier: 1.1, skillCooldown: 9,
    skillName: 'Rage Mode', description: 'Damage x2 dan lebih cepat selama 6 detik.',
    weapon: { name: 'Kapak Perang', desc: 'Putaran 360° berat; menghantam semua yang mengelilingimu.' },
    attack: { type: 'cleave', cooldown: .55, stamina: 12, damage: 20, hits: 1, range: 100, arc: Math.PI * 2 } }
]);

/* Aturan achievement. Format: [kode statistik, nama tampilan, target-target] */
const ACHIEVEMENT_RULES = [
  ['kills', 'Monster', [1, 10, 50, 150, 400, 1000]],
  ['art', 'Artefak', [1, 5, 10, 25]],
  ['best', 'Skor', [500, 2000, 5000, 15000, 40000, 100000]],
  ['night', 'Malam', [1, 3, 5, 10]],
  ['wave', 'Gelombang', [3, 10, 25]],
  ['combo', 'Streak', [3, 9, 15]],
  ['rs', 'Penyintas', [3, 15]],
  ['nt', 'Catatan', [10, 40]],
  ['nest', 'Tumpukan', [1, 20, 60]],
  ['crit', 'Critical', [10, 100]],
  ['dodge', 'Dodge', [20, 200]],
  ['room', 'Interior', [1, 10]],
  ['boss', 'Boss', [1, 5]]
];

const ACHIEVEMENTS = [];
ACHIEVEMENT_RULES.forEach(([statKey, label, targets]) => {
  targets.forEach(target => {
    ACHIEVEMENTS.push({ id: statKey + target, statKey, target, name: `${label} ${target}` });
  });
});
