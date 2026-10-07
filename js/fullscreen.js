/* ===== IMMERSIVE MODE =====
* Satu tombol kecil untuk fullscreen + landscape.
* Browser tetap dapat memblokir fullscreen tanpa user gesture,
* sehingga kita mencoba otomatis saat boot dan mengulang pada tap pertama.
*/
let immersiveActive = false;
let immersiveAttempted = false;
const immersiveButton = () => document.getElementById('immersiveToggle');
function isFullscreen() {
  return !! (document.fullscreenElement || document.webkitFullscreenElement);
}
function updateImmersiveButton() {
  const button = immersiveButton();
  if (!button) return;
  immersiveActive = isFullscreen();
  button.classList.toggle('hide',
  immersiveActive);
}
async function requestLandscape() {
  try {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      await screen.orientation.lock('landscape');
      return true;
    }
  } catch (e) {
  }
  return false;
}
async function requestGameFullscreen() {
  let fullscreenOk = isFullscreen();
  try {
    if (!fullscreenOk) {
      const el = document.documentElement;
      const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (fn) {
        const result = fn.call(el);
        if (result && typeof result.then === 'function') await result;
      }
      fullscreenOk = isFullscreen();
    }
  } catch (e) {
  }
  if (fullscreenOk) await requestLandscape();
  fit();
  updateImmersiveButton();
  immersiveAttempted = true;
  return fullscreenOk;
}
async function exitImmersiveMode() {
  try {
    if (screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock();
  } catch (e) {
  }
  try {
    if (isFullscreen()) {
      const fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (fn) await fn.call(document);
    }
  } catch (e) {
  }
  fit();
  updateImmersiveButton();
}
async function toggleImmersiveMode() {
  if (isFullscreen()) return exitImmersiveMode();
  return requestGameFullscreen();
}
async function enableImmersiveMode() {
  try {
    if (typeof au === 'function') au();
  } catch (e) {
  }
  if (isFullscreen()) {
    await requestLandscape();
    updateImmersiveButton();
    return;
  }
  await requestGameFullscreen();
}
const immersiveTapHandler = (event) => {
  if (event.target && event.target.closest && event.target.closest('#immersiveToggle')) return;
  void enableImmersiveMode();
};
addEventListener('pointerdown', immersiveTapHandler, {
  capture: true,
  once: false
});
document.addEventListener('fullscreenchange', () => {
  updateImmersiveButton(); fit()
});
document.addEventListener('webkitfullscreenchange', () => {
  updateImmersiveButton(); fit()
});
const button = immersiveButton();
if (button) button.addEventListener('click', e => {
  e.stopPropagation(); void toggleImmersiveMode()
});
let rz;
function fit() {
  const s = Math.min(innerWidth / canvasWidth,
  innerHeight / canvasHeight);
  canvas.style.transform = `translate(${(innerWidth-canvasWidth*s)/2}px,${(innerHeight-canvasHeight*s)/2}px) scale(${s})`;
}
addEventListener('resize', () => {
  clearTimeout(rz); rz = setTimeout(fit,
  80)
});
addEventListener('orientationchange', () => setTimeout(fit, 200));
fit();
setTimeout(() => {
  if (GAME_CONFIG.ui.autoFullscreen || GAME_CONFIG.ui.autoLandscape) void enableImmersiveMode();
}, 250);
