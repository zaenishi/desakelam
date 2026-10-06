/* ============================================================
 * FULLSCREEN + LANDSCAPE (auto saat tap pertama)
 * ============================================================
 * Browser modern mensyaratkan user gesture untuk fullscreen,
 * jadi kita trigger pada pointerdown pertama.
 * ============================================================ */

let fullscreenTriggered = false;

function enterFullscreenAndLandscape() {
  const cfg = GAME_CONFIG.fullscreen;

  const el = document.documentElement;
  const req = el.requestFullscreen
           || el.webkitRequestFullscreen
           || el.mozRequestFullScreen
           || el.msRequestFullscreen;

  const doLock = () => {
    if (!cfg.lockLandscape) return;
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch { /* abaikan */ }
  };

  if (!req) return Promise.resolve(doLock());

  try {
    const promise = req.call(el);
    return (promise && promise.then)
      ? promise.then(doLock).catch(() => doLock())
      : Promise.resolve(doLock());
  } catch {
    return Promise.resolve(doLock());
  }
}

function onFirstInteraction() {
  if (typeof au === 'function') au();           // buka AudioContext
  if (fullscreenTriggered) return;
  if (!GAME_CONFIG.fullscreen.autoOnFirstTouch) return;
  fullscreenTriggered = true;
  enterFullscreenAndLandscape();
}

addEventListener('pointerdown', onFirstInteraction, { capture: true, once: true });
addEventListener('touchstart',  onFirstInteraction, { capture: true, once: true, passive: true });

/* ---------- Resize / fit canvas ---------- */
let resizeTimer;
function fitCanvas() {
  const scale = Math.min(innerWidth / W, innerHeight / H);
  C.style.transform =
    `translate(${(innerWidth - W * scale) / 2}px,` +
    `${(innerHeight - H * scale) / 2}px) scale(${scale})`;
}

addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fitCanvas, 80);
});
addEventListener('orientationchange', () => setTimeout(fitCanvas, 200));

fitCanvas();