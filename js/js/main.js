/* ===== LOOP ===== */
function frame(now) {
  requestAnimationFrame(frame);
  let rd = Math.min(.05, (now - lastFrameTime) / 1000 || 0);
  lastFrameTime = now;
  t += rd;
  timeScale +=(1 - timeScale) * Math.min(1, rd * 2.5);
  if(hitStop > 0) {
    hitStop -= rd;
    rd = 0
  }
  const dt = rd * timeScale;
  screenShake *= .9;
  if(screenShake < .3)screenShake = 0;
  screenFlash = Math.max(0, screenFlash - rd * 2.5);
  if(gameState == 'menu' || gameState == 'load') {
    if(randomValue() < .002)weather =['clear', 'rain', 'fog'][randomValue() * 3|0];
    if(AC &&(runtimeState.pn =(runtimeState.pn || 0) - rd) <= 0) {
      runtimeState.pn = 1.6;
      tone([261, 311, 392, 349, 233][randomValue() * 5|0], 1.4, 'triangle', .06)
    }
    menuScene();
    return
  }
  if(gameState == 'intro') {
    it += rd;
    if(it > 8 && !runtimeState.sp) {
      runtimeState.sp = 1;
      runtimeState.ctl = 1;
      for(let i = 0; i < 3; i++) {
        const m = mk('sh', player.x + 200 + i * 50, player.y - 80 + i * 70, .5);
        go(m, 'chase');
        monsters.push(m)
      }
    }
    if(it > 15 && !runtimeState.sc) {
      runtimeState.sc = 1;
      timeScale = .25;
      scare()
    }
    if(it >= 20)endIntro();
    if(gameState != 'intro') {
      return
    }
    upGame(dt)
  } else if(gameState == 'play') {
    upGame(dt)
  }
  if(gameState == 'pause' || gameState == 'end' || gameState == 'play' || gameState == 'intro') {
    const tx = player.x - canvasWidthValue / 2,
    ty = player.y - canvasHeightValue / 2;
    camera.x +=(clampValue(tx, 0, worldWidthValue - canvasWidthValue) - camera.x) * Math.min(1, rd * 8);
    camera.y +=(clampValue(ty, 0, worldHeightValue - canvasHeightValue) - camera.y) * Math.min(1, rd * 8);
    drawWorld();
    post();
    if(gameState == 'intro')introScene();
    else hud();
    if(sc &&(gameState == 'play' || runtimeState.sc))face();
    if(FD > 0) {
      gameCanvasContext.fillStyle = `rgba(0,0,0,${FD})`;
      gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
      FD = Math.max(0, FD - rd * 1.2)
    }
  }
}
function init() {
  genWorld();
  for(let i = 0; i < 40; i++)fireflies.push({
    x:randomValue() * canvasWidthValue, y:200 + randomValue() * 300, p:randomValue() * 9
  });
  reset('classic');
  player.x = 300;
  player.y = 430;
  if(typeof isLoggedIn === 'function' && isLoggedIn()) {
    gameState = 'menu';
    domQuery('#sk').style.display = 'none';
    toMenu();
  } else {
    gameState = 'intro';
    domQuery('#sk').style.display = 'block';
  }
  requestAnimationFrame(n => {
    lastFrameTime = n; frame(n)
  })
}
async function boot() {
  await initDatabase();
  if(typeof Tournament !== 'undefined')Tournament.start();
  addEventListener('pagehide', () => {
    if(gameState == 'play' && gameMode == 'classic')submitScore(score|0)
  });
  document.addEventListener('visibilitychange', () => {
    if(document.hidden && GAME_CONFIG.gameplay.pauseWhenHidden && gameState == 'play')pauseT()
  });
  init()
}
boot();
