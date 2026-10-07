/*
 * ============================================================
 * ACCOUNT.JS — PROFIL, KODE AKSES, RANKING, ACHIEVEMENT
 * ============================================================
 */

const DEFAULT_PLAYER_PROFILE = {
  name: '',
  uid: '',
  characterIndex: 0,
  bestScore: 0,
  points: 0,
  gamesPlayed: 0,
  stats: {},
  achievements: [],
  accessCode: '',
  skinUnlocked: 0,
  ownedWeapons: ['rustblade'],
  equippedWeapon: 'rustblade',
  ownedSkills: ['class'],
  equippedSkill: 'class',
  tutorialCompleted: false
};

function normalizePlayerProfile(savedProfile = {}) {
  return Object.assign({}, DEFAULT_PLAYER_PROFILE, {
    name: savedProfile.name || '',
    uid: savedProfile.uid || '',
    characterIndex: Math.max(0, Math.min(CHARACTER_CLASSES.length - 1, Number(savedProfile.characterIndex ?? savedProfile.ch ?? 0) || 0)),
    bestScore: Number(savedProfile.bestScore ?? savedProfile.best ?? 0),
    points: Number(savedProfile.points ?? savedProfile.pts ?? 0),
    gamesPlayed: Number(savedProfile.gamesPlayed ?? savedProfile.games ?? 0),
    stats: savedProfile.stats || savedProfile.st || {},
    achievements: Array.isArray(savedProfile.achievements)
      ? savedProfile.achievements
      : (Array.isArray(savedProfile.ach) ? savedProfile.ach : []),
    accessCode: savedProfile.accessCode || savedProfile.code || '',
    skinUnlocked: Number(savedProfile.skinUnlocked ?? savedProfile.skin ?? 0),
    ownedWeapons: Array.isArray(savedProfile.ownedWeapons) ? [...new Set(savedProfile.ownedWeapons.map(String))] : ['rustblade'],
    equippedWeapon: savedProfile.equippedWeapon || 'rustblade',
    ownedSkills: Array.isArray(savedProfile.ownedSkills) ? [...new Set(savedProfile.ownedSkills.map(String))] : ['class'],
    equippedSkill: savedProfile.equippedSkill || 'class',
    tutorialCompleted: Boolean(savedProfile.tutorialCompleted)
  });
}

let playerProfile = normalizePlayerProfile(MLDatabase.getCachedUser() || {});

let selectedCharacterIndex = playerProfile.characterIndex || 0;
let leaderboardCache = MLDatabase.getCachedLeaderboard();

let interiorIndex = 0;
let interiorObject = null;
let currentRoom = null;
let monsterNests = [];
let night = 1;
let foundDocuments = 0;

function getCurrentCharacterClass() {
  return CHARACTER_CLASSES[playerProfile.characterIndex] || CHARACTER_CLASSES[0];
}

function isLoggedIn() {
  return Boolean(playerProfile.uid && playerProfile.name && playerProfile.accessCode);
}

function savePlayerProfile() {
  sv(DATABASE_CONFIG.legacy.user, playerProfile);
  MLDatabase.saveUser(playerProfile);
}

function getNightDifficultyMultiplier() {
  return 1 + (night - 1) * 0.3;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[character]));
}

function updatePlayerStat(statKey, amount, setMaximum = false) {
  const stats = playerProfile.stats;
  stats[statKey] = setMaximum
    ? Math.max(stats[statKey] || 0, amount)
    : (stats[statKey] || 0) + amount;
}

function addScore(amount) {
  const base = Math.max(0, Number(amount) || 0);
  const multiplier = (1 + Math.min(4, (P?.sk || 0) / 3 | 0)) * (weather === 'eclipse' ? 2 : 1);
  const gainedScore = Math.max(0, Math.round(base * multiplier));
  const gainedPoints = Math.max(0, Math.round(base));
  score += gainedScore;
  playerProfile.points = Math.max(0, Number(playerProfile.points || 0) + gainedPoints);
}

function checkAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    if (playerProfile.achievements.includes(achievement.id)) continue;

    const value = achievement.statKey === 'best'
      ? Math.max(playerProfile.bestScore, score | 0)
      : (playerProfile.stats[achievement.statKey] || 0);

    const target = Number(achievement.target ?? achievement.id.slice(achievement.statKey.length));

    if (value >= target) {
      playerProfile.achievements.push(achievement.id);
      say('🏆 ' + achievement.name, 4);
      SFX.lvl();
      score += 50;
      savePlayerProfile();
      break;
    }
  }
}

function createPlayerId(seedText) {
  let hash = 0;
  for (const character of seedText) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return 'ML-' + hash.toString(36).toUpperCase().padStart(5, '0').slice(0, 6);
}

function createRandomPlayerId() {
  return 'ML-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function initDatabase() {
  await MLDatabase.init();

  if (playerProfile.uid) {
    const savedProfile = await MLDatabase.getUser(playerProfile.uid);
    if (savedProfile) {
      playerProfile = Object.assign(playerProfile, savedProfile);
    }
  }

  leaderboardCache = MLDatabase.getLeaderboardSync();
  savePlayerProfile();
}

function getLeaderboardEntries() {
  return leaderboardCache;
}

function getPlayerRank(value) {
  return 1 + getLeaderboardEntries().filter(
    entry => entry.uid !== playerProfile.uid && entry.score > value
  ).length;
}

function getMyRank() {
  return getPlayerRank(Math.max(playerProfile.bestScore, score | 0));
}

function submitScore(finalScore) {
  finalScore |= 0;

  if (finalScore > playerProfile.bestScore) {
    playerProfile.bestScore = finalScore;
  }

  savePlayerProfile();

  const leaderboardEntry = {
    uid: playerProfile.uid,
    name: playerProfile.name,
    characterIndex: playerProfile.characterIndex,
    score: playerProfile.bestScore,
    kills: playerProfile.stats.kills || 0,
    night: playerProfile.stats.night || 0,
    timestamp: Date.now()
  };

  const existingEntry = leaderboardCache.find(
    entry => entry.uid === playerProfile.uid
  );

  if (existingEntry) {
    Object.assign(existingEntry, leaderboardEntry);
  } else {
    leaderboardCache.push(leaderboardEntry);
  }

  leaderboardCache.sort((a, b) => b.score - a.score);
  leaderboardCache = leaderboardCache.slice(0, GAME_CONFIG.leaderboard.maxEntries);

  MLDatabase.submitScore(leaderboardEntry);
}

function routePlayer() {
  // Session lengkap: langsung ke menu, jangan tampilkan login lagi.
  if (isLoggedIn()) {
    toMenu();
    return;
  }

  if (!playerProfile.accessCode) {
    show('menu', 0);
    show('gate', 1);
  } else if (!playerProfile.name) {
    showRegistration();
  } else {
    toMenu();
  }
}

function submitAccessCode() {
  const accessCode = $('#code').value.trim().toUpperCase();

  if (ACCESS_CODES.includes(accessCode)) {
    playerProfile.accessCode = accessCode;
    savePlayerProfile();
    SFX.pick();
    show('gate', 0);
    showRegistration();
  } else {
    $('#ge').textContent = 'Kode tidak valid. Hubungi panitia.';
    SFX.hurt();
  }
}

function showRegistration() {
  ['menu', 'gate', 'prof'].forEach(id => show(id, 0));

  $('#nm').value = playerProfile.name || '';
  $('#chg').innerHTML = CHARACTER_CLASSES.map((character, index) => `
    <button class="chc" data-i="${index}">
      <b>${character.emoji}</b>${character.name}
    </button>
  `).join('');

  selectCharacter(playerProfile.characterIndex || 0);
  show('reg', 1);
}

function selectCharacter(characterIndex) {
  selectedCharacterIndex = characterIndex;

  document.querySelectorAll('.chc').forEach(button => {
    button.classList.toggle('on', Number(button.dataset.i) === characterIndex);
  });

  const character = CHARACTER_CLASSES[characterIndex] || CHARACTER_CLASSES[0];
  $('#re').style.color = '#caa';
  $('#re').textContent = `${character.skillName}: ${character.description} · HP x${character.hpMultiplier} · Speed x${character.speedMultiplier}`;
}

function submitRegistration() {
  const playerName = $('#nm').value
    .trim()
    .replace(GAME_CONFIG.registration.allowedNamePattern, '');

  if (playerName.length < GAME_CONFIG.registration.minNameLength) {
    $('#re').style.color = '#f55';
    $('#re').textContent = `Nama minimal ${GAME_CONFIG.registration.minNameLength} karakter (huruf/angka).`;
    SFX.hurt();
    return;
  }

  playerProfile.name = GAME_CONFIG.registration.uppercaseName === false ? playerName : playerName.toUpperCase();
  playerProfile.characterIndex = selectedCharacterIndex;
  playerProfile.tutorialCompleted = Boolean(playerProfile.tutorialCompleted);

  if (!playerProfile.uid) {
    playerProfile.uid = createPlayerId(
      `${playerProfile.name}-${Date.now()}-${Math.random()}`
    ) || createRandomPlayerId();
  }

  savePlayerProfile();
  toMenu();
}

function openRanking() {
  show('menu', 0);
  renderRanking();
  show('rank', 1);
}

function renderRanking() {
  const entries = getLeaderboardEntries()
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, GAME_CONFIG.leaderboard.displayEntries);

  $('#rs').textContent = 'Database lokal — IndexedDB + cache browser';

  $('#rl').innerHTML = entries.length
    ? entries.map((entry, index) => {
        const character = CHARACTER_CLASSES[entry.characterIndex] || CHARACTER_CLASSES[0];
        return `
          <div class="rw ${entry.uid === playerProfile.uid ? 'me' : ''}">
            <span>${['🥇', '🥈', '🥉'][index] || (index + 1) + '.'}</span>
            <span>${escapeHtml(entry.name)} <small>${escapeHtml(entry.uid)}</small></span>
            <span>${character ? character.emoji : ''}</span>
            <span>${entry.score}</span>
          </div>
        `;
      }).join('')
    : '<div class="rw">Belum ada skor. Jadilah yang pertama!</div>';
}

function openProfile() {
  show('menu', 0);

  const character = getCurrentCharacterClass();
  const stats = playerProfile.stats;

  $('#pn').textContent = `${playerProfile.name} - ${playerProfile.uid} [${character.name}]`;
  $('#pd').innerHTML = `${character.emoji} Skill: ${character.skillName}<br>
    Skor terbaik ${playerProfile.bestScore} · Rank #${getPlayerRank(playerProfile.bestScore)}<br>
    Monster ${stats.kills || 0} · Artefak ${stats.art || 0} · Malam ${stats.night || 0} · Main ${playerProfile.gamesPlayed}<br>
    Achievement ${playerProfile.achievements.length}/${ACHIEVEMENTS.length}`;

  $('#pa').innerHTML = ACHIEVEMENTS.map(achievement => `
    <span class="ac ${playerProfile.achievements.includes(achievement.id) ? 'on' : ''}">
      ${achievement.name}
    </span>
  `).join('');

  show('prof', 1);
}
