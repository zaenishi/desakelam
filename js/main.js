/* ===== LOOP ===== */
function frame(now) {
  requestAnimationFrame(frame);
  let rd = Math.min(.05,
  (now - lastTimestamp) / 1000 || 0);
  lastTimestamp = now;
  elapsedTime += rd;
  timeScale += (1 - timeScale) * Math.min(1,
  rd * 2.5);
  if (hitStop > 0) {
    hitStop -= rd;
    rd = 0
  }
  const dt = rd * timeScale;
  screenShake *=.9;
  if (screenShake <.3)screenShake = 0;
  screenFlash = Math.max(0,
  screenFlash - rd * 2.5);
  if (gameState == 'menu' || gameState == 'load') {
    if (random() <.002)weather = ['clear',
    'rain',
    'fog'][random() * 3 | 0];
    if (audioContext && (runtimeState.pn = (runtimeState.pn || 0) - rd) <= 0) {
      runtimeState.pn = 1.6;
      tone([261,
      311,
      392,
      349,
      233][random() * 5 | 0],
      1.4,
      'triangle',
      .06)
    }
    menuScene();
    return
  }
  if (gameState == 'intro') {
    introProgress += rd;
    if (introProgress > 8 &&! runtimeState.sp) {
      runtimeState.sp = 1;
      runtimeState.ctl = 1;
      for (let i = 0; i < 3; i++) {
        const m = mk('sh',
        player.x + 200 + i * 50,
        player.y - 80 + i * 70,
        .5);
        go(m,
        'chase');
        monsters.push(m)
      }
    }
    if (introProgress > 15 &&! runtimeState.scareEffect) {
      runtimeState.scareEffect = 1;
      timeScale =.25;
      scare()
    }
    if (introProgress >= 20)endIntro();
    if (gameState != 'intro') {
      return
    }
    upGame(dt)
  } else if (gameState == 'play') {
    upGame(dt)
  }
  if (gameState == 'pause' || gameState == 'end' || gameState == 'play' || gameState == 'intro') {
    const tx = player.x - canvasWidth / 2,
    ty = player.y - canvasHeight / 2;
    camera.x += (clamp(tx,
    0,
    worldWidth - canvasWidth) - camera.x) * Math.min(1,
    rd * 8);
    camera.y += (clamp(ty,
    0,
    worldHeight - canvasHeight) - camera.y) * Math.min(1,
    rd * 8);
    drawWorld();
    post();
    if (gameState == 'intro')introScene();
    else hud();
    if (scareEffect && (gameState == 'play' || runtimeState.scareEffect))face();
    if (fadeAmount > 0) {
      context.fillStyle = `rgba(0,0,0,${fadeAmount})`;
      context.fillRect(0,
      0,
      canvasWidth,
      canvasHeight);
      fadeAmount = Math.max(0,
      fadeAmount - rd * 1.2)
    }
  }
}
function init() {
  genWorld();
  for (let i = 0; i < 40; i++)fireflies.push({
    x: random() * canvasWidth,
    y: 200 + random() * 300,
    p: random() * 9
  });
  reset('classic');
  player.x = 300;
  player.y = 430;
  if (typeof isLoggedIn === 'function' && isLoggedIn()) {
    gameState = 'menu';
    querySelector('#sk').style.display = 'none';
    toMenu();
  } else {
    gameState = 'intro';
    querySelector('#sk').style.display = 'block';
  }
  requestAnimationFrame(n => {
    lastTimestamp = n; frame(n)
  })
}
async function boot() {
  await initDatabase();
  if (typeof Tournament !== 'undefined')Tournament.start();
  addEventListener('pagehide',
  () => {
    if (gameState == 'play' && MODE == 'classic')submitScore(score | 0)
  });
  document.addEventListener('visibilitychange',
  () => {
    if (document.hidden && GAME_CONFIG.gameplay.pauseWhenHidden && gameState == 'play')pauseT()
  });
  init()
}
boot();
