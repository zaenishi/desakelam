/* ===== INTERIOR BANGUNAN ===== */
function doorNear() {
  if(gameMode != 'classic' || gameState != 'play')return 0;
  if(isInsideRoom)return player.y > worldHeightValue - 70 && Math.abs(player.x - worldWidthValue / 2) < 50?'exit':0;
  for(const o of obstacles)if((o.z == 0 || o.z == 1 || o.z == 4) && !o.lake && !o.tower && Math.abs(player.x -(o.x + o.w / 2)) < 44 && player.y > o.y + o.h - 4 && player.y < o.y + o.h + 56)return o;
  return 0
}
function useDoor() {
  const d = doorNear();
  if(!d)return;
  SFX.door();
  FD = 1;
  d === 'exit'?leave():enter(d)
}
function enter(o) {
  updatePlayerStat('room', 1);
  outsideWorldState = {
    monsters,
    items,
    obstacles,
    spawnedMonsterNests,
    projectiles,
    x:player.x,
    y:player.y + 10,
    worldWidthValue,
    worldHeightValue
  };
  isInsideRoom = 1;
  worldWidthValue = 960;
  worldHeightValue = 540;
  obstacles =[{
    x:0, y:0, w:960, h:70
  }, {
    x:0, y:0, w:40, h:540
  }, {
    x:920, y:0, w:40, h:540
  }, {
    x:150, y:150, w:120, h:50
  }, {
    x:690, y:150, w:120, h:50
  }, {
    x:400, y:300, w:160, h:40
  }];
  roomState = {
    z:o.z,
    next:1,
    open:0
  };
  const q =[1, 2, 3].sort(() => randomValue() - .5);
  monsters =[];
  projectiles =[];
  spawnedMonsterNests =[];
  items =[{
    k:'cd', n:q[0], x:200, y:420
  }, {
    k:'cd', n:q[1], x:480, y:440
  }, {
    k:'cd', n:q[2], x:760, y:420
  }, {
    k:'chest', x:480, y:110
  }, {
    k:'med', x:100, y:300
  }, {
    k:'note', x:860, y:300, i:randomValue() * 10|0
  }];
  const ty = o.z == 0?['sh', 'sh']:o.z == 1?['bo', 'sp']:['gh', 'gh', 'sh'];
  ty.forEach((k, i) => {
    const m = mk(k, 300 + i * 150, 200 + randomValue() * 60, .9 * getNightDifficultyMultiplier()); if(o.z == 1 && i == 0)m.guard = 1; monsters.push(m)
  });
  player.x = 480;
  player.y = 400;
  player.dd = 0;
  say('Urutkan lilin 1 → 2 → 3 untuk membuka peti!', 5)
}
function leave() {
  if(!outsideWorldState)return;
  ({
    monsters, items, obstacles, spawnedMonsterNests, projectiles
  }
  = outsideWorldState);
  player.x = outsideWorldState.x;
  player.y = outsideWorldState.y;
  worldWidthValue = outsideWorldState.worldWidthValue;
  worldHeightValue = outsideWorldState.worldHeightValue;
  isInsideRoom = 0;
  outsideWorldState = null
}
function cdTouch(it) {
  runtimeState.cdc = .6;
  if(it.n == roomState.next) {
    it.lit = 1;
    roomState.next++;
    SFX.pick();
    if(roomState.next > 3) {
      roomState.open = 1;
      SFX.lvl();
      say('Peti terbuka!', 2)
    }
  } else {
    roomState.next = 1;
    items.forEach(i => {
      if(i.k == 'cd')i.lit = 0
    });
    player.sn = Math.max(0, player.sn - 12);
    SFX.scare();
    const m = mk('sh', player.x + 80, player.y - 60, 1);
    go(m, 'chase');
    monsters.push(m);
    say('Urutan salah! Bayangan terbangun...', 3)
  }
}
function drawRoom() {
  const c =['#2a1a12', '#3a2f12', '#25222d'][roomState.z == 0?0:roomState.z == 1?1:2];
  gameCanvasContext.fillStyle = c;
  gameCanvasContext.fillRect(0, 0, 960, 540);
  gameCanvasContext.fillStyle = '#0003';
  for(let y = 60; y < 540; y += 30)gameCanvasContext.fillRect(0, y, 960, 2);
  obstacles.forEach((o, i) => {
    gameCanvasContext.fillStyle = i < 3?'#0c0806':'#4a3220'; gameCanvasContext.fillRect(o.x, o.y, o.w, o.h)
  });
  gameCanvasContext.fillStyle = '#ffd70033';
  gameCanvasContext.fillRect(worldWidthValue / 2 - 40, worldHeightValue - 20, 80, 20);
  gameCanvasContext.fillStyle = '#ffd700';
  gameCanvasContext.font = '11px Cinzel';
  gameCanvasContext.textAlign = 'center';
  gameCanvasContext.fillText('KELUAR', worldWidthValue / 2, worldHeightValue - 6)
}
function hud2() {
  const mu =(1 + Math.min(4, player.sk / 3|0)) *(weather == 'eclipse'?2:1);
  gameCanvasContext.textAlign = 'left';
  if(gameMode == 'classic') {
    gameCanvasContext.fillStyle = '#fff';
    gameCanvasContext.font = 'bold 15px Cinzel';
    gameCanvasContext.fillText('SKOR ' +(score|0), 12, 104);
    gameCanvasContext.font = '12px Cinzel';
    gameCanvasContext.fillStyle = mu > 1?'#ff6':'#caa';
    gameCanvasContext.fillText(`x${mu}  streak ${player.sk}  ·  Rank #${getMyRank()}  ·  Sarang ${spawnedMonsterNests.length}`, 12, 121)
  }
  gameCanvasContext.fillStyle = player.scd > 0?'#777':'#8f8';
  gameCanvasContext.font = '12px Cinzel';
  gameCanvasContext.fillText(player.scd > 0?`${getCurrentCharacterClass().skillName} ${Math.ceil(player.scd)}s`:`${getCurrentCharacterClass().skillName} SIAP (K)`, 12, 138);
  const dn = doorNear();
  if(dn) {
    gameCanvasContext.textAlign = 'center';
    gameCanvasContext.fillStyle = '#ffd700';
    gameCanvasContext.font = '14px Cinzel';
    gameCanvasContext.fillText(dn === 'exit'?'[F] Keluar':'[F] Masuk bangunan', canvasWidthValue / 2, canvasHeightValue - 90)
  }
  if(isTouchDevice)domQuery('#bI').style.display = dn?'block':'none'
}
