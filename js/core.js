/* ===== DASAR ===== */
const domQuery = s => document.querySelector(s), gameCanvas = domQuery('#c'), gameCanvasContext = gameCanvas.getContext('2d'), canvasWidthValue = GAME_CONFIG.canvas.width, canvasHeightValue = GAME_CONFIG.canvas.height, randomValue = Math.random, piValue = Math.PI;
let worldWidthValue = GAME_CONFIG.world.width, worldHeightValue = GAME_CONFIG.world.height;
const clampValue =(v, a, b) => Math.max(a, Math.min(b, v)), distanceBetween =(a, b) => Math.hypot(a.x - b.x, a.y - b.y), angleDifference =(a, b) =>((a - b + 3 * piValue) %(2 * piValue)) - piValue;
const fillCircle =(x, y, r, c) => {
  gameCanvasContext.fillStyle = c;
  gameCanvasContext.beginPath();
  gameCanvasContext.arc(x, y, r, 0, 7);
  gameCanvasContext.fill()
};
const isTouchDevice = matchMedia('(pointer:coarse)').matches;
if(isTouchDevice)document.body.classList.add('touch');
let gameState = 'intro', gameMode = 'classic', t = 0, lastFrameTime = 0, screenShake = 0, hitStop = 0, timeScale = 1, screenFlash = 0, camera = {
  x:0,
  y:0
}, it = 0, runtimeState = {
}, sc = null, msg = null;
let player, monsters =[], items =[], projectiles =[], effects =[], floatingTexts =[], obstacles =[], doorCollisions =[], gameTime = 0, waveNumber = 0, waveTimer = 0, trainingStep = 0, score = 0, weather = 'clear', weatherTimer = 0, bossActive = 0, fireflies =[], rain =[];
const sv =(k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch(e) {
  }
}, ld =(k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d
  } catch(e) {
    return d
  }
};
