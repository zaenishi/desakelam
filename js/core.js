/* ===== DASAR ===== */
const querySelector = s => document.querySelector(s), canvas = querySelector('#c'), context = canvas.getContext('2d'), canvasWidth = GAME_CONFIG.canvas.width, canvasHeight = GAME_CONFIG.canvas.height, random = Math.random, PI = Math.PI;
let worldWidth = GAME_CONFIG.world.width, worldHeight = GAME_CONFIG.world.height;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), angd = (a, b) => ((a - b + 3 * PI) % (2 * PI)) - PI;
const ci = (x, y, r, c) => {
  context.fillStyle = c;
  context.beginPath();
  context.arc(x,
  y,
  r,
  0,
  7);
  context.fill()
};
const isTouchDevice = matchMedia('(pointer:coarse)').matches;
if (isTouchDevice)document.body.classList.add('touch');
let gameState = 'intro', MODE = 'classic', elapsedTime = 0, lastTimestamp = 0, screenShake = 0, hitStop = 0, timeScale = 1, screenFlash = 0, camera = {
  x: 0,
  y: 0
}, introProgress = 0, runtimeState = {
}, scareEffect = null, statusMessage = null;
let player, monsters = [], items = [], projectiles = [], effects = [], floatingTexts = [], obstacles = [], groundDetails = [], gameTime = 0, currentWave = 0, waveTimer = 0, trainingStep = 0, score = 0, weather = 'clear', weatherTimer = 0, bossActive = 0, fireflies = [], rain = [];
const saveLocalJson = (k, v) => {
  try {
    localStorage.setItem(k,
    JSON.stringify(v))
  } catch (e) {
  }
}, loadLocalJson = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k))??d
  } catch (e) {
    return d
  }
};
