/*
 * ============================================================
 * ACCOUNT.JS — PROFIL, KODE AKSES, SKOR, ACHIEVEMENT
 * (Layar UI ada di ui-*.js; file ini hanya data & logika.)
 * ============================================================
 */
const DEFAULT_PLAYER_PROFILE = {
  name: '', uid: '', characterIndex: 0, bestScore: 0, totalScore: 0, gamesPlayed: 0,
  stats: {}, achievements: [], accessCode: '', skinUnlocked: 0,
  coins: 0, upgrades: {}, weapons: ['basic'], equippedWeapon: 'basic', charLocked: false
};

function normalizePlayerProfile(saved = {}) {
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const weapons = Array.isArray(saved.weapons) ? saved.weapons.filter(w => typeof w === 'string') : [];
  if (!weapons.includes('basic')) weapons.unshift('basic');
  const eq = weapons.includes(saved.equippedWeapon) ? saved.equippedWeapon : 'basic';
  return Object.assign({}, DEFAULT_PLAYER_PROFILE, {
    name: saved.name || '',
    uid: saved.uid || '',
    characterIndex: cl0(num(saved.characterIndex ?? saved.ch, 0)),
    bestScore: num(saved.bestScore ?? saved.best),
    totalScore: Math.max(num(saved.totalScore), num(saved.bestScore ?? saved.best)),
    gamesPlayed: num(saved.gamesPlayed ?? saved.games),
    stats: (saved.stats || saved.st) && typeof (saved.stats || saved.st) === 'object' ? (saved.stats || saved.st) : {},
    achievements: Array.isArray(saved.achievements) ? saved.achievements : (Array.isArray(saved.ach) ? saved.ach : []),
    accessCode: saved.accessCode || saved.code || '',
    skinUnlocked: num(saved.skinUnlocked ?? saved.skin),
    coins: Math.max(0, Math.floor(num(saved.coins))),
    upgrades: saved.upgrades && typeof saved.upgrades === 'object' ? saved.upgrades : {},
    weapons, equippedWeapon: eq,
    charLocked: !!saved.charLocked
  });
}
function cl0(i) { return Math.max(0, Math.min(CHARACTER_CLASSES.length - 1, Math.floor(i))); }

let playerProfile = normalizePlayerProfile(MLDatabase.getCachedUser() || {});
let selectedCharacterIndex = playerProfile.characterIndex || 0;
let leaderboardCache = MLDatabase.getCachedLeaderboard();
let night = 1;
let runCounted = 0; /* skor run ini yang sudah dihitung ke totalScore */

function getCurrentCharacterClass() { return CHARACTER_CLASSES[playerProfile.characterIndex] || CHARACTER_CLASSES[0]; }
function isLoggedIn() {
  const codeOk = !GAME_CONFIG.accessCodeRequired || !!playerProfile.accessCode;
  return Boolean(playerProfile.uid && playerProfile.name && codeOk);
}
function savePlayerProfile() {
  sv(DATABASE_CONFIG.legacy.user, playerProfile);
  MLDatabase.saveUser(playerProfile);
  Events.emit('profile', playerProfile);
}
function getNightDifficultyMultiplier() { return 1 + (night - 1) * 0.3; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function updatePlayerStat(statKey, amount, setMaximum = false) {
  const stats = playerProfile.stats;
  stats[statKey] = setMaximum ? Math.max(stats[statKey] || 0, amount) : (stats[statKey] || 0) + amount;
}
function addScore(amount) {
  score += Math.round(amount * (1 + Math.min(4, P.sk / 3 | 0)) * (weather === 'eclipse' ? 2 : 1));
}
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (playerProfile.achievements.includes(a.id)) continue;
    const value = a.statKey === 'best' ? Math.max(playerProfile.bestScore, score | 0) : (playerProfile.stats[a.statKey] || 0);
    if (value >= a.target) {
      playerProfile.achievements.push(a.id);
      say('🏆 ' + a.name, 4);
      SFX.lvl();
      score += 50;
      savePlayerProfile();
      break;
    }
  }
}
function createPlayerId(seedText) {
  let hash = 0;
  for (const ch of seedText) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 'ML-' + hash.toString(36).toUpperCase().padStart(5, '0').slice(0, 6);
}
function createRandomPlayerId() { return 'ML-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
function createUniquePlayerId(name) {
  const used = new Set(getLeaderboardEntries().map(e => e.uid));
  for (let i = 0; i < 20; i++) {
    const id = i < 10 ? createPlayerId(`${name}-${Date.now()}-${Math.random()}`) : createRandomPlayerId();
    if (!used.has(id)) return id;
  }
  return createRandomPlayerId() + Date.now().toString(36).slice(-2).toUpperCase();
}

async function initDatabase() {
  await MLDatabase.init();
  if (playerProfile.uid) {
    const saved = await MLDatabase.getUser(playerProfile.uid);
    if (saved) playerProfile = normalizePlayerProfile(Object.assign({}, playerProfile, saved));
  }
  selectedCharacterIndex = playerProfile.characterIndex;
  leaderboardCache = MLDatabase.getLeaderboardSync();
  savePlayerProfile();
}
function getLeaderboardEntries() { return leaderboardCache; }
/* Papan peringkat berubah real-time (Firebase) -> segarkan cache lokal untuk HUD/rank. */
Events.on('leaderboard', () => { leaderboardCache = MLDatabase.getLeaderboardSync(); });
function getPlayerRank(value) {
  return 1 + getLeaderboardEntries().filter(e => e.uid !== playerProfile.uid && e.score > value).length;
}
function getMyRank() { return getPlayerRank(Math.max(playerProfile.bestScore, score | 0)); }
/* Selama turnamen leaderboard dikunci -> peringkat disembunyikan juga. */
function rankText(value) {
  if (typeof Tournament !== 'undefined' && Tournament.isLeaderboardLocked()) return '🔒';
  return '#' + getPlayerRank(value);
}
function newRun() { runCounted = 0; }

function submitScore(finalScore) {
  finalScore |= 0;
  if (!playerProfile.uid) return;
  const delta = Math.max(0, finalScore - runCounted);
  runCounted = Math.max(runCounted, finalScore);
  playerProfile.totalScore += delta;
  if (finalScore > playerProfile.bestScore) playerProfile.bestScore = finalScore;
  savePlayerProfile();

  const entry = {
    uid: playerProfile.uid, name: playerProfile.name, characterIndex: playerProfile.characterIndex,
    score: playerProfile.bestScore, kills: playerProfile.stats.kills || 0, night: playerProfile.stats.night || 0,
    timestamp: Date.now()
  };
  const existing = leaderboardCache.find(e => e.uid === playerProfile.uid);
  if (existing) Object.assign(existing, entry); else leaderboardCache.push(entry);
  leaderboardCache.sort((a, b) => b.score - a.score);
  leaderboardCache = leaderboardCache.slice(0, GAME_CONFIG.leaderboard.maxEntries);
  MLDatabase.submitScore(entry);

  /* Skor turnamen = skor terbaik pemain SELAMA turnamen berlangsung (bukan skor lama). */
  if (typeof Tournament !== 'undefined' && Tournament.acceptsScore()) {
    MLDatabase.submitTournamentScore(Tournament.currentTid(), Object.assign({}, entry, { score: finalScore, timestamp: Date.now() }));
  }
}

/* ---------- alur login ---------- */
function routePlayer() {
  if (isLoggedIn()) { UI.set(MENU_STATE); return; }
  if (GAME_CONFIG.accessCodeRequired && !playerProfile.accessCode) UI.set(GATE_STATE);
  else UI.set(CHARACTER_SELECT_STATE, { first: true });
}
function submitAccessCode() {
  const code = $('#code').value.trim().toUpperCase();
  if (ACCESS_CODES.includes(code)) {
    playerProfile.accessCode = code;
    savePlayerProfile();
    SFX.pick();
    UI.set(CHARACTER_SELECT_STATE, { first: true });
  } else {
    $('#ge').textContent = 'Kode tidak valid. Hubungi panitia.';
    SFX.hurt();
  }
}
/* Karakter terkunci selama sesi (hanya jika turnamen aktif di config). */
function isCharacterLocked() {
  return !!(GAME_CONFIG.session.lockCharacter && GAME_CONFIG.tournament.active && playerProfile.charLocked && playerProfile.name);
}
function unlockCharacter() { playerProfile.charLocked = false; savePlayerProfile(); }
