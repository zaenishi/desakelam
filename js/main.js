/* ===== LOOP UTAMA ===== */
const MENU_LIKE = ['menu', 'load'];
function frame(now) {
  requestAnimationFrame(frame);
  let rd = Math.min(.05, (now - last) / 1000 || 0); last = now; t += rd;
  slow += (1 - slow) * Math.min(1, rd * 2.5);
  if (hitstop > 0) { hitstop -= rd; rd = 0; }
  const dt = rd * slow; shake *= .9; if (shake < .3) shake = 0; flash = Math.max(0, flash - rd * 2.5);

  if (MENU_LIKE.includes(S)) {
    if (R() < .002) weather = ['clear', 'rain', 'fog'][R() * 3 | 0];
    if (AC && (I.pn = (I.pn || 0) - rd) <= 0) { I.pn = 1.6; tone([261, 311, 392, 349, 233][R() * 5 | 0], 1.4, 'triangle', .06); }
    menuScene(); return;
  }
  if (S == 'cine') { Cinematic.frame(rd); return; }

  if (S == 'intro') {
    it += rd;
    if (it > 8 && !I.sp) { I.sp = 1; I.ctl = 1; for (let i = 0; i < 3; i++) { const m = mk('sh', P.x + 200 + i * 50, P.y - 80 + i * 70, .5); go(m, 'chase'); M.push(m); } }
    if (it > 15 && !I.sc) { I.sc = 1; slow = .25; scare(); }
    if (it >= 20) endIntro();
    if (S != 'intro') return;
    upGame(dt);
  } else if (S == 'play') upGame(dt);

  if (S == 'pause' || S == 'end' || S == 'tend' || S == 'play' || S == 'intro') {
    const tx = P.x - W / 2, ty = P.y - H / 2;
    cam.x += (cl(tx, 0, WW - W) - cam.x) * Math.min(1, rd * 8); cam.y += (cl(ty, 0, WH - H) - cam.y) * Math.min(1, rd * 8);
    drawWorld(); post(); if (S == 'intro') introScene(); else hud();
    if (sc && (S == 'play' || I.sc)) face();
    if (FD > 0) { X.fillStyle = `rgba(0,0,0,${FD})`; X.fillRect(0, 0, W, H); FD = Math.max(0, FD - rd * 1.2); }
  }
}
function init() {
  genWorld();
  for (let i = 0; i < 40; i++) fireflies.push({ x: R() * W, y: 200 + R() * 300, p: R() * 9 });
  reset('classic'); P.x = 300; P.y = 430;
  UI.set(isLoggedIn() ? MENU_STATE : INTRO_STATE);
  requestAnimationFrame(n => { last = n; frame(n); });
}
async function boot() {
  await initDatabase();
  Tournament.init();
  addEventListener('pagehide', () => { if (S == 'play' && MODE == 'classic') submitScore(score | 0); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && GAME_CONFIG.gameplay.pauseWhenHidden && S == 'play') pauseT(); });
  init();
}
boot();
