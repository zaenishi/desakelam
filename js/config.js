/*
* ============================================================
* CONFIG.JS — PUSAT PENGATURAN GAME
* ============================================================
* File ini sengaja dibuat sebagai tempat utama untuk mengubah
* pengaturan game tanpa perlu membongkar logika gameplay.
*
* Yang biasanya diubah developer:
* - nama game
* - ukuran dunia
* - kode akses
* - karakter
* - achievement
* - pengaturan database
* - batas leaderboard
* ============================================================
*/
const GAME_CONFIG = Object.freeze({
  app: {
    name: 'Malam Kelam di Desa Terkutuk',
    version: '2.1.0',
    environment: 'production',
    debug: false
  },
  name: 'Malam Kelam di Desa Terkutuk',
  canvas: {
    width: 960,
    height: 540
  },
  world: {
    width: 2400,
    height: 1600
  },
  leaderboard: {
    maxEntries: 300,
    displayEntries: 50,
    submitOnlyBestScore: true
  },
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
    credits: ['@zaenishi',
    '@kawan-kawan-labkom']
  },
  tournament: {
    enabled: true,
    enabledToday: true,
    date: null,
    startTime: '00:00',
    endTime: '16:30',
    warningMinutes: 1,
    countdownSeconds: 3,
    topWinners: 3,
    revealDelayMs: 2200,
    redirectToLeaderboard: true,
    requireAccessCode: true
  }
});
const DATABASE_CONFIG = Object.freeze({
  provider: 'indexeddb',
  name: 'malam_kelam_db',
  version: 2,
  stores: {
    users: 'users',
    leaderboard: 'leaderboard',
    metadata: 'metadata'
  },
  cache: {
    user: 'ml_cache_user',
    leaderboard: 'ml_cache_leaderboard',
    session: 'ml_session',
    prefix: 'ml:v3:'
  },
  remote: {
    supabase: {
      url: '',
      anonKey: '',
      usersTable: 'users',
      leaderboardTable: 'leaderboard'
    },
    firebase: {
      config: {
      }
    }
  },
  realtime: {
    enabled: false,
    pollIntervalMs: 5000
  },
  legacy: {
    user: 'ml_me',
    leaderboard: 'ml_lb2',
    skin: 'ml_skin'
  }
});
/*
* Kode akses turnamen.
* Tambahkan kode baru di array ini jika diperlukan.
*/
const ACCESS_CODES = Object.freeze([ 'TURNAMEN26', 'LEGENDA26', 'MALAM2026', 'LAB2024']);
/*
* Semua karakter berada di sini agar mudah ditambah/diubah.
*
* Contoh karakter baru:
* {
*   id: 'sa',
*   name: 'Samurai',
*   emoji: '⚔️',
*   color: '#7a2020',
*   hpMultiplier: 1.1,
*   speedMultiplier: 1.05,
*   damageMultiplier: 1.15,
*   skillCooldown: 8,
*   skillName: 'Iaijutsu',
*   description: 'Serangan cepat ke depan'
* }
*/
const CHARACTER_CLASSES = Object.freeze([ {
  id: 'kn',
  name: 'Knight',
  emoji: '🛡️',
  color: '#5a6a8a',
  hpMultiplier: 1.25,
  speedMultiplier:.95,
  damageMultiplier: 1,
  skillCooldown: 7,
  skillName: 'Shield Bash',
  description: 'kebal 2 detik + hantaman area'
}, {
  id: 'ma',
  name: 'Mage',
  emoji: '🔮',
  color: '#7a3a9a',
  hpMultiplier:.9,
  speedMultiplier: 1,
  damageMultiplier: 1,
  skillCooldown: 8,
  skillName: 'Arcane Blast',
  description: 'ledakan area besar'
}, {
  id: 'ar',
  name: 'Archer',
  emoji: '🏹',
  color: '#3a6a3a',
  hpMultiplier: 1,
  speedMultiplier: 1.1,
  damageMultiplier:.95,
  skillCooldown: 5,
  skillName: 'Multi Shot',
  description: 'lima panah beruntun'
}, {
  id: 'ro',
  name: 'Rogue',
  emoji: '🗡️',
  color: '#6a2a2a',
  hpMultiplier:.9,
  speedMultiplier: 1.15,
  damageMultiplier: 1.1,
  skillCooldown: 7,
  skillName: 'Shadow Strike',
  description: 'teleport ke musuh + kritis'
}, {
  id: 'pr',
  name: 'Priest',
  emoji: '✨',
  color: '#a89a3a',
  hpMultiplier: 1.1,
  speedMultiplier: 1,
  damageMultiplier:.9,
  skillCooldown: 10,
  skillName: 'Holy Heal',
  description: 'heal 35 HP + sanity'
}, {
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
}]);
/*
* Aturan achievement.
* Format: [kode statistik, nama tampilan, target-target]
*/
const ACHIEVEMENT_RULES = [ ['kills', 'Monster', [1, 10, 50, 150, 400, 1000]], ['art', 'Artefak', [1, 5, 10, 25]], ['best', 'Skor', [500, 2000, 5000, 15000, 40000, 100000]], ['night', 'Malam', [1, 3, 5, 10]], ['wave', 'Gelombang', [3, 10, 25]], ['combo', 'Streak', [3, 9, 15]], ['rs', 'Penyintas', [3, 15]], ['nt', 'Catatan', [10, 40]], ['nest', 'Sarang', [1, 20, 60]], ['crit', 'Critical', [10, 100]], ['dodge', 'Dodge', [20, 200]], ['room', 'Interior', [1, 10]], ['boss', 'Boss', [1, 5]]];
const ACHIEVEMENTS = [];
ACHIEVEMENT_RULES.forEach(([statKey, label, targets]) => {
  targets.forEach(target => {
    ACHIEVEMENTS.push({
      id: statKey + target,
      statKey,
      target,
      name: `${label} ${target}`
    });
  });
});
