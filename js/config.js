/*
 * ============================================================
 * CONFIG.JS — PUSAT PENGATURAN GAME
 * ============================================================
 * Semua pengaturan yang biasanya diubah developer ada di sini.
 * Jangan hardcode di file gameplay!
 * ============================================================
 */

const GAME_CONFIG = Object.freeze({
  name: 'Malam Kelam di Desa Terkutuk',
  version: '2.0.0',

  canvas: { width: 960, height: 540 },
  world:  { width: 2400, height: 1600 },

  leaderboard: {
    maxEntries: 300,       // maksimum entri tersimpan
    displayEntries: 50     // yang ditampilkan di UI
  },

  registration: {
    minNameLength: 2,
    maxNameLength: 12,
    allowedNamePattern: /[^A-Za-z0-9 ]/g
  },

  /* ----------------------------------------------------------
   * FULLSCREEN & LANDSCAPE
   * ---------------------------------------------------------- */
  fullscreen: {
    autoOnFirstTouch: true,   // auto fullscreen saat tap pertama
    lockLandscape: true,      // paksa orientasi landscape
    showRotateHint: true      // tampilkan hint "putar perangkat"
  },

  /* ----------------------------------------------------------
   * CREDITS — ubah di sini, muncul di menu utama
   * ---------------------------------------------------------- */
  credits: {
    title: 'KREDIT',
    subtitle: 'Malam Kelam di Desa Terkutuk',
    showFooter: true,         // tampilkan footer kecil di menu
    entries: [
      { role: 'Pengembang Utama', name: '@zaenishi' },
      { role: 'Tim Pendukung',    name: '@kawan-kawan labkom' }
    ],
    footer: 'Terima kasih telah bermain! 🎃'
  },

  /* ----------------------------------------------------------
   * TURNAMEN
   * ----------------------------------------------------------
   * Cara kerja:
   *  - Jika `enabled: true` dan `date` cocok dengan hari ini
   *    (atau `date: null` = hari ini), mode turnamen aktif.
   *  - Menu utama menampilkan "TURNAMEN" (bukan "START").
   *  - Pada `endTime` turnamen berakhir → hitung mundur 3,2,1
   *    → reveal juara 1..N dengan backsound dramatis
   *    → redirect ke leaderboard.
   *  - Untuk mematikan turnamen: set `enabled: false`.
   *  - Untuk turnamen tanggal tertentu: set `date: '2026-03-17'`.
   * ---------------------------------------------------------- */
  tournament: {
    enabled: true,
    date: null,               // 'YYYY-MM-DD' atau null (hari ini)
    startTime: '16:00',       // mulai turnamen
    endTime: '16:30',         // akhir turnamen → trigger reveal
    warningMinutes: 1,        // pemberitahuan sisa waktu (menit)
    countdownSeconds: 3,      // hitung mundur 3,2,1
    revealDelayMs: 2500,      // jeda antar juara (ms)
    topWinners: 3,            // tampilkan juara 1..N
    redirectToLeaderboard: true
  }
});

/* ============================================================
 * DATABASE CONFIG
 * ============================================================
 * Ubah `provider` untuk berpindah backend:
 *   'local'    → IndexedDB + localStorage (default, offline)
 *   'supabase' → isi url & anonKey di bawah
 *   'firebase' → isi config di bawah
 * ============================================================ */
const DATABASE_CONFIG = Object.freeze({
  provider: 'local',

  name: 'malam_kelam_db',
  version: 1,
  stores: {
    users: 'users',
    leaderboard: 'leaderboard'
  },

  cache: {
    user: 'ml_cache_user',
    leaderboard: 'ml_cache_leaderboard',
    session: 'ml_session'
  },

  /* Kunci lama — dibaca untuk kompatibilitas, jangan dihapus. */
  legacy: {
    user: 'ml_me',
    leaderboard: 'ml_lb2',
    skin: 'ml_skin'
  },

  /* Isi jika pindah ke Supabase */
  supabase: {
    url: '',
    anonKey: '',
    tables: { users: 'users', leaderboard: 'leaderboard' }
  },

  /* Isi jika pindah ke Firebase */
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  }
});

/* ============================================================
 * KODE AKSES
 * ============================================================ */
const ACCESS_CODES = Object.freeze([
  'TURNAMEN26',
  'LEGENDA26',
  'MALAM2026',
  'LAB2024'
]);

/* ============================================================
 * KARAKTER
 * ============================================================ */
const CHARACTER_CLASSES = Object.freeze([
  { id: 'kn', name: 'Knight',   emoji: '🛡️', color: '#5a6a8a', hpMultiplier: 1.25, speedMultiplier: .95, damageMultiplier: 1,    skillCooldown: 7,  skillName: 'Shield Bash',  description: 'kebal 2 detik + hantaman area' },
  { id: 'ma', name: 'Mage',     emoji: '🔮', color: '#7a3a9a', hpMultiplier: .9,  speedMultiplier: 1,   damageMultiplier: 1,    skillCooldown: 8,  skillName: 'Arcane Blast', description: 'ledakan area besar' },
  { id: 'ar', name: 'Archer',   emoji: '🏹', color: '#3a6a3a', hpMultiplier: 1,   speedMultiplier: 1.1, damageMultiplier: .95,  skillCooldown: 5,  skillName: 'Multi Shot',   description: 'lima panah beruntun' },
  { id: 'ro', name: 'Rogue',    emoji: '🗡️', color: '#6a2a2a', hpMultiplier: .9,  speedMultiplier: 1.15,damageMultiplier: 1.1,  skillCooldown: 7,  skillName: 'Shadow Strike',description: 'teleport ke musuh + kritis' },
  { id: 'pr', name: 'Priest',   emoji: '✨', color: '#a89a3a', hpMultiplier: 1.1, speedMultiplier: 1,   damageMultiplier: .9,   skillCooldown: 10, skillName: 'Holy Heal',    description: 'heal 35 HP + sanity' },
  { id: 'be', name: 'Berserker',emoji: '⚔️', color: '#a4501a', hpMultiplier: 1.15,speedMultiplier: 1,   damageMultiplier: 1.1,  skillCooldown: 9,  skillName: 'Rage Mode',    description: 'damage x2 selama 6 detik' }
]);

/* ============================================================
 * ACHIEVEMENT
 * ============================================================ */
const ACHIEVEMENT_RULES = [
  ['kills', 'Monster',   [1, 10, 50, 150, 400, 1000]],
  ['art',   'Artefak',   [1, 5, 10, 25]],
  ['best',  'Skor',      [500, 2000, 5000, 15000, 40000, 100000]],
  ['night', 'Malam',     [1, 3, 5, 10]],
  ['wave',  'Gelombang', [3, 10, 25]],
  ['combo', 'Streak',    [3, 9, 15]],
  ['rs',    'Penyintas', [3, 15]],
  ['nt',    'Catatan',   [10, 40]],
  ['nest',  'Sarang',    [1, 20, 60]],
  ['crit',  'Critical',  [10, 100]],
  ['dodge', 'Dodge',     [20, 200]],
  ['room',  'Interior',  [1, 10]],
  ['boss',  'Boss',      [1, 5]]
];

const ACHIEVEMENTS = [];
ACHIEVEMENT_RULES.forEach(([statKey, label, targets]) => {
  targets.forEach(target => {
    ACHIEVEMENTS.push({ id: statKey + target, statKey, name: `${label} ${target}` });
  });
});