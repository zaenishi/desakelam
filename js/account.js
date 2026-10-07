/*
 * ============================================================
 * ACCOUNT.JS — PLAYER PROFILE, AUTH, LEADERBOARD
 * ============================================================
 *
 * Prinsip:
 * - Satu sumber data profile: playerProfile.
 * - Session disimpan oleh MLDatabase.
 * - User lama dimigrasikan otomatis.
 * - UID dibuat sekali dan tidak berubah saat reload.
 * ============================================================
 */

const DEFAULT_PLAYER_PROFILE = Object.freeze({
  name: '',
  uid: '',
  characterIndex: 0,
  bestScore: 0,
  gamesPlayed: 0,
  stats: {},
  achievements: [],
  accessCode: '',
  skinUnlocked: 0,
  createdAt: 0,
  updatedAt: 0
});

function normalizePlayerProfile(savedProfile = {}) {
  const stats = savedProfile.stats || savedProfile.st || {};

  const normalized = {
    ...DEFAULT_PLAYER_PROFILE,
    ...savedProfile,
    name: String(savedProfile.name || '').trim(),
    uid: String(savedProfile.uid || '').trim(),
    characterIndex: Number(
      savedProfile.characterIndex ?? savedProfile.ch ?? 0
    ),
    bestScore: Number(
      savedProfile.bestScore ?? savedProfile.best ?? 0
    ),
    gamesPlayed: Number(
      savedProfile.gamesPlayed ?? savedProfile.games ?? 0
    ),
    stats: { ...stats },
    achievements: Array.isArray(savedProfile.achievements)
      ? [...savedProfile.achievements]
      : (Array.isArray(savedProfile.ach)
        ? [...savedProfile.ach]
        : []),
    accessCode: String(
      savedProfile.accessCode || savedProfile.code || ''
    ),
    skinUnlocked: Number(
      savedProfile.skinUnlocked ?? savedProfile.skin ?? 0
    ),
    createdAt: Number(savedProfile.createdAt || Date.now()),
    updatedAt: Number(savedProfile.updatedAt || Date.now())
  };

  if (
    normalized.characterIndex < 0 ||
    normalized.characterIndex >= CHARACTER_CLASSES.length
  ) {
    normalized.characterIndex = 0;
  }

  return normalized;
}

let playerProfile = normalizePlayerProfile(
  MLDatabase.getCachedUser() || {}
);

let selectedCharacterIndex = playerProfile.characterIndex;
let leaderboardCache = MLDatabase.getCachedLeaderboard();

let interiorIndex = 0;
let interiorObject = null;
let currentRoom = null;
let monsterNests = [];
let night = 1;
let foundDocuments = 0;

function getCurrentCharacterClass() {
  return (
    CHARACTER_CLASSES[playerProfile.characterIndex] ||
    CHARACTER_CLASSES[0]
  );
}

function savePlayerProfile() {
  playerProfile.updatedAt = Date.now();

  // Jangan menunggu network/IndexedDB karena save dipanggil
  // sangat sering selama gameplay.
  void MLDatabase.saveUser(playerProfile);
}

function getNightDifficultyMultiplier() {
  return 1 + (night - 1) * 0.3;
}

function updatePlayerStat(statKey, amount, setMaximum = false) {
  const stats = playerProfile.stats;

  stats[statKey] = setMaximum
    ? Math.max(stats[statKey] || 0, amount)
    : (stats[statKey] || 0) + amount;
}

function addScore(amount) {
  score += Math.round(
    amount *
    (1 + Math.min(4, P.sk / 3 | 0)) *
    (weather === 'eclipse' ? 2 : 1)
  );
}

function checkAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    if (playerProfile.achievements.includes(achievement.id)) {
      continue;
    }

    const value = achievement.statKey === 'best'
      ? Math.max(playerProfile.bestScore, score | 0)
      : (playerProfile.stats[achievement.statKey] || 0);

    if (value >= achievement.target) {
      playerProfile.achievements.push(achievement.id);
      say(`🏆 ${achievement.name}`, 4);
      SFX.lvl();
      score += 50;
      savePlayerProfile();
      break;
    }
  }
}

function createPlayerId(seedText = '') {
  /*
   * crypto.randomUUID() membuat UID lebih aman dari bentrok.
   * Prefix ML memudahkan identifikasi di leaderboard.
   */
  try {
    if (crypto && typeof crypto.randomUUID === 'function') {
      return `ML-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    }
  } catch {}

  let hash = 2166136261;

  for (const character of String(seedText)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return `ML-${(hash >>> 0).toString(36).toUpperCase().padStart(6, '0')}`;
}

function createRandomPlayerId() {
  return createPlayerId(
    `${Date.now()}-${Math.random()}-${Math.random()}`
  );
}

function isProfileComplete() {
  return Boolean(
    playerProfile.uid &&
    playerProfile.name
  );
}

function shouldRequireAccessCode() {
  const tournament = GAME_CONFIG.tournament;

  if (!tournament.enabled) return false;
  if (!tournament.accessCodeRequiredOnlyDuringTournament) {
    return Boolean(tournament.requireAccessCode);
  }

  return (
    tournament.requireAccessCode &&
    typeof Tournament !== 'undefined' &&
    Tournament.isWithinWindow()
  );
}

async function initDatabase() {
  await MLDatabase.init();

  const cached = MLDatabase.getCurrentUser();

  if (cached && cached.uid) {
    playerProfile = normalizePlayerProfile({
      ...playerProfile,
      ...cached
    });
  }

  /*
   * Kalau session valid, ambil profile terbaru dari database.
   * Ini membuat reload tidak meminta login lagi.
   */
  if (playerProfile.uid) {
    const savedProfile = await MLDatabase.getUser(playerProfile.uid);

    if (savedProfile) {
      playerProfile = normalizePlayerProfile({
        ...playerProfile,
        ...savedProfile
      });
    }
  }

  leaderboardCache = MLDatabase.getLeaderboardSync();

  if (playerProfile.uid) {
    savePlayerProfile();
  }
}

function refreshLeaderboardCache() {
  leaderboardCache = MLDatabase.getLeaderboardSync();
  return leaderboardCache;
}

function getLeaderboardEntries() {
  return refreshLeaderboardCache();
}

function getPlayerRank(value) {
  const safeValue = Number(value || 0);

  return 1 + getLeaderboardEntries().filter(
    entry =>
      entry.uid !== playerProfile.uid &&
      Number(entry.score || 0) > safeValue
  ).length;
}

function getMyRank() {
  return getPlayerRank(
    Math.max(playerProfile.bestScore, score | 0)
  );
}

async function submitScore(finalScore) {
  if (!isProfileComplete()) return;

  const safeScore = Math.max(0, Number(finalScore || 0));

  if (safeScore > playerProfile.bestScore) {
    playerProfile.bestScore = safeScore;
  }

  const leaderboardEntry = {
    uid: playerProfile.uid,
    name: playerProfile.name,
    characterIndex: playerProfile.characterIndex,
    score: playerProfile.bestScore,
    kills: playerProfile.stats.kills || 0,
    night: playerProfile.stats.night || 0,
    timestamp: Date.now()
  };

  await MLDatabase.submitScore(leaderboardEntry);
  leaderboardCache = MLDatabase.getLeaderboardSync();
  savePlayerProfile();
}

function routePlayer() {
  /*
   * PROFILE + SESSION VALID = langsung masuk menu.
   * Tidak meminta kode/nama ulang.
   */
  if (isProfileComplete()) {
    toMenu();
    return;
  }

  if (shouldRequireAccessCode() && !playerProfile.accessCode) {
    show('menu', 0);
    show('reg', 0);
    show('gate', 1);
    return;
  }

  showRegistration();
}

function submitAccessCode() {
  const input = $('#code');
  const error = $('#ge');

  const accessCode = input.value
    .trim()
    .toUpperCase();

  if (!ACCESS_CODES.includes(accessCode)) {
    error.textContent = 'Kode tidak valid. Hubungi panitia.';
    SFX.hurt();
    return;
  }

  playerProfile.accessCode = accessCode;
  savePlayerProfile();

  SFX.pick();
  show('gate', 0);
  showRegistration();
}

function showRegistration() {
  ['menu', 'gate', 'prof', 'credits'].forEach(id => show(id, 0));

  $('#nm').value = playerProfile.name || '';

  $('#chg').innerHTML = CHARACTER_CLASSES.map(
    (character, index) => `
      <button class="chc" data-i="${index}">
        <b>${character.emoji}</b>${character.name}
      </button>
    `
  ).join('');

  selectCharacter(
    Number.isInteger(playerProfile.characterIndex)
      ? playerProfile.characterIndex
      : 0
  );

  show('reg', 1);
}

function selectCharacter(characterIndex) {
  const safeIndex = Math.max(
    0,
    Math.min(
      CHARACTER_CLASSES.length - 1,
      Number(characterIndex) || 0
    )
  );

  selectedCharacterIndex = safeIndex;

  document.querySelectorAll('.chc').forEach(button => {
    button.classList.toggle(
      'on',
      Number(button.dataset.i) === safeIndex
    );
  });

  const character = CHARACTER_CLASSES[safeIndex];

  $('#re').style.color = '#caa';
  $('#re').textContent =
    `${character.skillName}: ${character.description} · ` +
    `HP x${character.hpMultiplier} · ` +
    `Speed x${character.speedMultiplier} · ` +
    `Cooldown ${character.skillCooldown}s`;
}

function submitRegistration() {
  const rawName = $('#nm').value.trim();

  const playerName = rawName
    .replace(
      GAME_CONFIG.registration.allowedNamePattern,
      ''
    )
    .slice(
      0,
      GAME_CONFIG.registration.maxNameLength
    );

  if (
    playerName.length <
    GAME_CONFIG.registration.minNameLength
  ) {
    $('#re').style.color = '#f55';
    $('#re').textContent =
      `Nama minimal ${GAME_CONFIG.registration.minNameLength} ` +
      'karakter (huruf/angka).';
    SFX.hurt();
    return;
  }

  playerProfile.name =
    GAME_CONFIG.registration.uppercaseName
      ? playerName.toUpperCase()
      : playerName;

  playerProfile.characterIndex = selectedCharacterIndex;

  if (!playerProfile.uid) {
    playerProfile.uid = createPlayerId(
      `${playerProfile.name}-${Date.now()}-${Math.random()}`
    );
  }

  if (!playerProfile.createdAt) {
    playerProfile.createdAt = Date.now();
  }

  savePlayerProfile();
  toMenu();
}

function openRanking() {
  show('menu', 0);
  show('prof', 0);
  show('credits', 0);

  renderRanking();
  show('rank', 1);
}

function renderRanking() {
  const entries = getLeaderboardEntries()
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(
      0,
      GAME_CONFIG.leaderboard.displayEntries
    );

  $('#rs').textContent =
    MLDatabase.provider() === 'indexeddb'
      ? 'Leaderboard lokal — siap dimigrasikan ke database realtime.'
      : 'Leaderboard realtime.';

  $('#rl').innerHTML = entries.length
    ? entries.map((entry, index) => {
        const character =
          CHARACTER_CLASSES[entry.characterIndex];

        return `
          <div class="rw ${entry.uid === playerProfile.uid ? 'me' : ''}">
            <span>${['🥇', '🥈', '🥉'][index] || `${index + 1}.`}</span>
            <span>
              ${escapeHtml(entry.name)}
              <small>${escapeHtml(entry.uid)}</small>
            </span>
            <span>${character ? character.emoji : '❔'}</span>
            <span>${Number(entry.score || 0)}</span>
          </div>
        `;
      }).join('')
    : '<div class="rw">Belum ada skor. Jadilah yang pertama!</div>';
}

function openProfile() {
  show('menu', 0);
  show('rank', 0);
  show('credits', 0);

  const character = getCurrentCharacterClass();
  const stats = playerProfile.stats || {};

  $('#pn').textContent =
    `${playerProfile.name || 'PEMAIN'} - ` +
    `${playerProfile.uid || 'BELUM TERDAFTAR'} ` +
    `[${character.name}]`;

  $('#pd').innerHTML = `
    ${character.emoji} Skill: ${character.skillName}<br>
    Skor terbaik ${playerProfile.bestScore} ·
    Rank #${getPlayerRank(playerProfile.bestScore)}<br>
    Monster ${stats.kills || 0} ·
    Artefak ${stats.art || 0} ·
    Malam ${stats.night || 0} ·
    Main ${playerProfile.gamesPlayed}<br>
    Achievement ${playerProfile.achievements.length}/${ACHIEVEMENTS.length}
  `;

  $('#pa').innerHTML = ACHIEVEMENTS.map(
    achievement => `
      <span class="ac ${
        playerProfile.achievements.includes(achievement.id)
          ? 'on'
          : ''
      }">
        ${achievement.name}
      </span>
    `
  ).join('');

  show('prof', 1);
}

function openCredits() {
  ['menu', 'rank', 'prof', 'reg', 'gate'].forEach(
    id => show(id, 0)
  );

  const credits = GAME_CONFIG.ui.credits || [];

  $('#creditsNames').innerHTML = credits
    .map(name => `<div>${escapeHtml(name)}</div>`)
    .join('');

  show('credits', 1);
}
