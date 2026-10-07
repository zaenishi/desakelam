/*
 * ============================================================
 * GAME CONFIGURATION
 * ============================================================
 * Semua pengaturan yang biasanya diubah tim berada di sini.
 *
 * Aturan tim:
 * 1. Ubah angka/teks di file ini sebelum mengubah logic.
 * 2. Jangan simpan secret server/database di frontend.
 * 3. Database layer dibuat provider-agnostic agar nanti bisa
 *    diganti Supabase/Firebase tanpa membongkar gameplay.
 * ============================================================
 */

const GAME_CONFIG = Object.freeze({
  app: {
    name: 'Malam Kelam di Desa Terkutuk',
    version: '2.0.0',
    environment: 'production',
    debug: false
  },

  canvas: {
    width: 960,
    height: 540
  },

  world: {
    width: 2400,
    height: 1600
  },

  gameplay: {
    mode: 'classic',
    scorePerSecond: 3,
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

  leaderboard: {
    maxEntries: 300,
    displayEntries: 50,
    submitOnlyBestScore: true,
    sortDirection: 'desc'
  },

  cache: {
    profileTtlMs: 30 * 24 * 60 * 60 * 1000,
    leaderboardTtlMs: 5 * 60 * 1000,
    sessionTtlMs: 30 * 24 * 60 * 60 * 1000
  },

  ui: {
    autoFullscreen: true,
    forceLandscape: true,
    showCredits: true,
    credits: [
      '@zaenishi',
      '@kawan-kawan-labkom'
    ]
  },

  /*
   * ==========================================================
   * TURNAMEN
   * ==========================================================
   *
   * enabledToday:
   *   true  = hari ini dapat menjadi hari turnamen.
   *   false = hari ini bukan turnamen.
   *
   * date:
   *   null       = otomatis gunakan tanggal hari ini.
   *   'YYYY-MM-DD' = hanya tanggal tersebut.
   *
   * endTime:
   *   '16:30' = turnamen berakhir pukul 16:30 waktu perangkat.
   *   false   = tidak ada turnamen.
   *
   * startTime:
   *   '00:00' = turnamen boleh dimulai sejak awal hari.
   *
   * warningMinutes:
   *   1 = tampilkan peringatan dramatis 1 menit sebelum selesai.
   *
   * countdownSeconds:
   *   3 = hitung mundur 3 → 2 → 1 → WAKTU HABIS.
   */
  tournament: {
    enabled: false,
    enabledToday: false,
    date: null,
    startTime: '00:00',
    endTime: '16:30',
    warningMinutes: 1,
    countdownSeconds: 3,
    topWinners: 3,
    revealDelayMs: 2400,
    redirectToLeaderboard: true,
    requireAccessCode: true,
    accessCodeRequiredOnlyDuringTournament: true
  }
});

const DATABASE_CONFIG = Object.freeze({
  /*
   * Provider aktif saat ini.
   *
   * 'indexeddb' = lokal, siap dipakai tanpa server.
   * 'supabase' / 'firebase' = titik migrasi provider.
   *
   * Gameplay hanya memakai MLDatabase sehingga provider dapat
   * diganti tanpa mengubah combat/render/update.
   */
  provider: 'indexeddb',

  name: 'malam_kelam_db',
  version: 2,

  stores: {
    users: 'users',
    leaderboard: 'leaderboard',
    metadata: 'metadata'
  },

  cache: {
    prefix: 'ml:v2:',
    user: 'ml:v2:user',
    leaderboard: 'ml:v2:leaderboard',
    session: 'ml:v2:session',
    settings: 'ml:v2:settings'
  },

  legacy: {
    user: 'ml_me',
    leaderboard: 'ml_lb2',
    skin: 'ml_skin'
  },

  realtime: {
    enabled: false,
    pollIntervalMs: 5000
  },

  remote: {
    supabase: {
      url: '',
      anonKey: '',
      tableUsers: 'users',
      tableLeaderboard: 'leaderboard'
    },
    firebase: {
      config: {}
    }
  }
});

/*
 * Kode akses. Untuk production yang serius, validasi kode
 * sebaiknya dipindahkan ke server/backend.
 */
const ACCESS_CODES = Object.freeze([
  'TURNAMEN26',
  'LEGENDA26',
  'MALAM2026',
  'LAB2024'
]);

const CHARACTER_CLASSES = Object.freeze([
  {
    id: 'kn',
    name: 'Knight',
    emoji: '🛡️',
    color: '#5a6a8a',
    hpMultiplier: 1.25,
    speedMultiplier: .95,
    damageMultiplier: 1,
    skillCooldown: 7,
    skillName: 'Shield Bash',
    description: 'kebal 2 detik + hantaman area'
  },
  {
    id: 'ma',
    name: 'Mage',
    emoji: '🔮',
    color: '#7a3a9a',
    hpMultiplier: .9,
    speedMultiplier: 1,
    damageMultiplier: 1,
    skillCooldown: 8,
    skillName: 'Arcane Blast',
    description: 'ledakan area besar'
  },
  {
    id: 'ar',
    name: 'Archer',
    emoji: '🏹',
    color: '#3a6a3a',
    hpMultiplier: 1,
    speedMultiplier: 1.1,
    damageMultiplier: .95,
    skillCooldown: 5,
    skillName: 'Multi Shot',
    description: 'lima panah beruntun'
  },
  {
    id: 'ro',
    name: 'Rogue',
    emoji: '🗡️',
    color: '#6a2a2a',
    hpMultiplier: .9,
    speedMultiplier: 1.15,
    damageMultiplier: 1.1,
    skillCooldown: 7,
    skillName: 'Shadow Strike',
    description: 'teleport ke musuh + kritis'
  },
  {
    id: 'pr',
    name: 'Priest',
    emoji: '✨',
    color: '#a89a3a',
    hpMultiplier: 1.1,
    speedMultiplier: 1,
    damageMultiplier: .9,
    skillCooldown: 10,
    skillName: 'Holy Heal',
    description: 'heal 35 HP + sanity'
  },
  {
    id: 'be',
    name: 'Berserker',
    emoji: '⚔️',
    color: '#a4501a',
    hpMultiplier: 1.15,
    speedMultiplier: 1,
    damageMultiplier: 1.1,
    skillCooldown: 9,
    skillName: 'Rage Mode',
    description: 'damage x2 selama 6 detik'
  }
]);

const ACHIEVEMENT_RULES = [
  ['kills', 'Monster', [1, 10, 50, 150, 400, 1000]],
  ['art', 'Artefak', [1, 5, 10, 25]],
  ['best', 'Skor', [500, 2000, 5000, 15000, 40000, 100000]],
  ['night', 'Malam', [1, 3, 5, 10]],
  ['wave', 'Gelombang', [3, 10, 25]],
  ['combo', 'Streak', [3, 9, 15]],
  ['rs', 'Penyintas', [3, 15]],
  ['nt', 'Catatan', [10, 40]],
  ['nest', 'Sarang', [1, 20, 60]],
  ['crit', 'Critical', [10, 100]],
  ['dodge', 'Dodge', [20, 200]],
  ['room', 'Interior', [1, 10]],
  ['boss', 'Boss', [1, 5]]
];

const ACHIEVEMENTS = [];
ACHIEVEMENT_RULES.forEach(([statKey, label, targets]) => {
  targets.forEach(target => {
    ACHIEVEMENTS.push({
      id: `${statKey}${target}`,
      statKey,
      target,
      name: `${label} ${target}`
    });
  });
});
