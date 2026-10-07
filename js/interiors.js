/* ===== INTERIOR BANGUNAN ===== */
function doorNear() {
  if (MODE != 'classic' || gameState != 'play')return 0;
  if (isInsideInterior)return player.y > worldHeight - 70 && Math.abs(player.x - worldWidth / 2) < 50 ? 'exit': 0;
  for (const o of obstacles)if ((o.z == 0 || o.z == 1 || o.z == 4) &&! o.lake &&! o.tower && Math.abs(player.x - (o.x + o.w / 2)) < 44 && player.y > o.y + o.h - 4 && player.y < o.y + o.h + 56)return o;
  return 0
}
function useDoor() {
  const d = doorNear();
  if (!d)return;
  SFX.door();
  fadeAmount = 1;
  d === 'exit' ? leave(): enter(d)
}
function enter(o) {
  updatePlayerStat('room',
  1);
  outsideState = {
    monsters,
    items,
    obstacles,
    monsterNests,
    projectiles,
    x: player.x,
    y: player.y + 10,
    worldWidth,
    worldHeight
  };
  isInsideInterior = 1;
  worldWidth = 960;
  worldHeight = 540;
  obstacles = [{
    x: 0,
    y: 0,
    w: 960,
    h: 70
  },
  {
    x: 0,
    y: 0,
    w: 40,
    h: 540
  },
  {
    x: 920,
    y: 0,
    w: 40,
    h: 540
  },
  {
    x: 150,
    y: 150,
    w: 120,
    h: 50
  },
  {
    x: 690,
    y: 150,
    w: 120,
    h: 50
  },
  {
    x: 400,
    y: 300,
    w: 160,
    h: 40
  }];
  roomState = {
    z: o.z,
    next: 1,
    open: 0
  };
  const q = [1,
  2,
  3].sort(() => random() -.5);
  monsters = [];
  projectiles = [];
  monsterNests = [];
  items = [{
    k: 'cd',
    n: q[0],
    x: 200,
    y: 420
  },
  {
    k: 'cd',
    n: q[1],
    x: 480,
    y: 440
  },
  {
    k: 'cd',
    n: q[2],
    x: 760,
    y: 420
  },
  {
    k: 'chest',
    x: 480,
    y: 110
  },
  {
    k: 'med',
    x: 100,
    y: 300
  },
  {
    k: 'note',
    x: 860,
    y: 300,
    i: random() * 10 | 0
  }];
  const ty = o.z == 0 ? ['sh',
  'sh']: o.z == 1 ? ['bo',
  'sp']: ['gh',
  'gh',
  'sh'];
  ty.forEach((k,
  i) => {
    const m = mk(k,
    300 + i * 150,
    200 + random() * 60,
    .9 * getNightDifficultyMultiplier()); if (o.z == 1 && i == 0)m.guard = 1; monsters.push(m)
  });
  player.x = 480;
  player.y = 400;
  player.dd = 0;
  say('Urutkan lilin 1 → 2 → 3 untuk membuka peti!',
  5)
}
function leave() {
  if (!outsideState)return;
  ({
    monsters,
    items,
    obstacles,
    monsterNests,
    projectiles
  }
  = outsideState);
  player.x = outsideState.x;
  player.y = outsideState.y;
  worldWidth = outsideState.worldWidth;
  worldHeight = outsideState.worldHeight;
  isInsideInterior = 0;
  outsideState = null
}
function cdTouch(it) {
  runtimeState.cdc =.6;
  if (it.n == roomState.next) {
    it.lit = 1;
    roomState.next++;
    SFX.pick();
    if (roomState.next > 3) {
      roomState.open = 1;
      SFX.lvl();
      say('Peti terbuka!',
      2)
    }
  } else {
    roomState.next = 1;
    items.forEach(i => {
      if (i.k == 'cd')i.lit = 0
    });
    player.sn = Math.max(0,
    player.sn - 12);
    SFX.scare();
    const m = mk('sh',
    player.x + 80,
    player.y - 60,
    1);
    go(m,
    'chase');
    monsters.push(m);
    say('Urutan salah! Bayangan terbangun...',
    3)
  }
}
function drawRoom() {
  const c = ['#2a1a12',
  '#3a2f12',
  '#25222d'][roomState.z == 0 ? 0: roomState.z == 1 ? 1: 2];
  context.fillStyle = c;
  context.fillRect(0,
  0,
  960,
  540);
  context.fillStyle = '#0003';
  for (let y = 60; y < 540; y += 30)context.fillRect(0,
  y,
  960,
  2);
  obstacles.forEach((o,
  i) => {
    context.fillStyle = i < 3 ? '#0c0806': '#4a3220'; context.fillRect(o.x,
    o.y,
    o.w,
    o.h)
  });
  context.fillStyle = '#ffd70033';
  context.fillRect(worldWidth / 2 - 40,
  worldHeight - 20,
  80,
  20);
  context.fillStyle = '#ffd700';
  context.font = '11px Cinzel';
  context.textAlign = 'center';
  context.fillText('KELUAR',
  worldWidth / 2,
  worldHeight - 6)
}
function hud2() {
  const mu = (1 + Math.min(4,
  player.sk / 3 | 0)) * (weather == 'eclipse' ? 2: 1);
  context.textAlign = 'left';
  if (MODE == 'classic') {
    context.fillStyle = '#fff';
    context.font = 'bold 15px Cinzel';
    context.fillText('SKOR ' + (score | 0),
    12,
    104);
    context.font = '12px Cinzel';
    context.fillStyle = mu > 1 ? '#ff6': '#caa';
    context.fillText(`x${mu}  streak ${player.sk}  ·  Rank #${getMyRank()}  ·  Sarang ${monsterNests.length}`,
    12,
    121)
  }
  context.fillStyle = player.scd > 0 ? '#777': '#8f8';
  context.font = '12px Cinzel';
  context.fillText(player.scd > 0 ? `${getCurrentCharacterClass().skillName} ${Math.ceil(player.scd)}s`: `${getCurrentCharacterClass().skillName} SIAP (K)`,
  12,
  138);
  const dn = doorNear();
  if (dn) {
    context.textAlign = 'center';
    context.fillStyle = '#ffd700';
    context.font = '14px Cinzel';
    context.fillText(dn === 'exit' ? '[F] Keluar': '[F] Masuk bangunan',
    canvasWidth / 2,
    canvasHeight - 90)
  }
  if (isTouchDevice)querySelector('#bI').style.display = dn ? 'block': 'none'
}
