/*
 * ============================================================
 * FULLSCREEN + LANDSCAPE
 * ============================================================
 */

let fsDone = false;

async function requestGameFullscreen() {
  try {
    const element = document.documentElement;

    const request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen;

    if (request) {
      await request.call(element);
    }
  } catch {}

  try {
    if (
      screen.orientation &&
      typeof screen.orientation.lock === 'function'
    ) {
      await screen.orientation.lock('landscape');
    }
  } catch {}

  fsDone = true;
  fit();
}

function fit() {
  const scale = Math.min(
    innerWidth / W,
    innerHeight / H
  );

  C.style.transform =
    `translate(${
      (innerWidth - W * scale) / 2
    }px,${
      (innerHeight - H * scale) / 2
    }px) scale(${scale})`;
}

addEventListener(
  'pointerdown',
  () => {
    au();

    if (
      !fsDone &&
      GAME_CONFIG.ui.autoFullscreen
    ) {
      void requestGameFullscreen();
    }
  },
  { capture: true }
);

let resizeTimer;

addEventListener('resize', () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(
    fit,
    80
  );
});

addEventListener(
  'orientationchange',
  () => setTimeout(fit, 200)
);

fit();
