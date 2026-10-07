/* ===== COMBAT ===== */
function atk() {
  if (player.cd > 0 || player.st < 8 || player.dd > 0)return;
  player.cd =.33;
  player.at =.22;
  player.st -= 8;
  player.noise =.6;
  player.swings++;
  SFX.swing();
  let b = null,
  bd = 170;
  for (const m of monsters)if (m.st != 'death') {
    const d = dist(player,
    m);
    if (d < bd) {
      bd = d;
      b = m
    }
  }
  if (b)player.face = Math.atan2(b.y - player.y,
  b.x - player.x);
  player.cmT = 1.2;
  player.cmb++;
  const crit = player.cmb >= 3;
  if (crit)player.cmb = 0;
  let hit = 0;
  for (const m of monsters) {
    if (m.st == 'death')continue;
    const d = dist(player,
    m);
    if (d < 85 + m.r && (d < m.r + 22 || Math.abs(angd(Math.atan2(m.y - player.y,
    m.x - player.x),
    player.face)) < PI / 2)) {
      hurtM(m,
      12 * getCurrentCharacterClass().damageMultiplier * (player.rage > 0 ? 2: 1) * (crit ? 2: 1),
      crit);
      hit = 1
    }
  }
  effects.push({
    k: 'slash',
    x: player.x,
    y: player.y,
    a: player.face,
    elapsedTime:.22,
    c: crit
  });
  monsterNests.forEach(n => {
    if (Math.hypot(n.x - player.x,
    n.y - player.y) < 95) {
      hitN(n,
      12 * getCurrentCharacterClass().damageMultiplier * (player.rage > 0 ? 2: 1) * (crit ? 2: 1)); hit = 1
    }
  });
  if (crit)updatePlayerStat('crit',
  1);
  if (crit) {
    effects.push({
      k: 'bolt',
      x: player.x + Math.cos(player.face) * 90,
      y: player.y + Math.sin(player.face) * 90,
      elapsedTime:.25
    });
    floatingTexts.push({
      s: 'CRITICAL!',
      x: player.x,
      y: player.y - 50,
      elapsedTime: 1,
      c: '#f33',
      z: 20
    })
  }
  if (hit) {
    hitStop = crit ?.1:.05;
    screenShake = Math.max(screenShake,
    crit ? 10: 5)
  }
}
function hurtM(m, d, crit) {
  if (m.elapsedTime.fly && 0)return;
  if (m.k == 'sh')d *= 1.5;
  m.hp -= d;
  m.fl =.1;
  const a = Math.atan2(m.y - player.y,
  m.x - player.x),
  kb = m.k == 'wo' || m.k == 'bo' ? 120: 260;
  m.kx = Math.cos(a) * kb;
  m.ky = Math.sin(a) * kb;
  floatingTexts.push({
    s: Math.round(d),
    x: m.x,
    y: m.y - m.r - 10,
    elapsedTime:.9,
    c: crit ? '#f22': '#fff',
    z: crit ? 22: 13
  });
  blood(m.x,
  m.y,
  crit ? 14: 7);
  (crit ? SFX.crit: SFX.hit)();
  effects.push({
    k: 'spark',
    x: m.x,
    y: m.y,
    elapsedTime:.15
  });
  if (m.hp <= 0) {
    m.st = 'death';
    m.stt = 0;
    SFX.die();
    player.kills++;
    addScore(m.guard ? 80 + m.mh | 0: 8 + (m.mh / 3 | 0));
    player.sk++;
    player.skT = 5;
    updatePlayerStat('kills',
    1);
    updatePlayerStat('combo',
    player.sk,
    1);
    if (m.bossActive)updatePlayerStat('boss',
    1);
    if (m.guard) {
      items.push({
        k: 'art',
        x: m.x,
        y: m.y
      });
      say('Artefak jatuh dari penjaga!',
      3)
    } else if (random() <.15)items.push({
      k: 'med',
      x: m.x,
      y: m.y
    });
    if (m.k == 'wo' && m.bossActive)newNight(1500 * night,
    'Gerbang terbuka!');
    if (m.guard || m.bossActive ||! monsters.some(q => q != m && q.st != 'death' && q.st == 'chase')) {
      timeScale =.3;
      screenShake = Math.max(screenShake,
      8)
    }
  } else if (m.k != 'wo' || m.hp < m.mh *.5) {
    m.st = 'hurt';
    m.stt = 0
  }
}
function blood(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = random() * 7,
    v = 40 + random() * 160;
    effects.push({
      k: 'p',
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      elapsedTime:.5 + random() *.4,
      c: random() <.7 ? '#a00': '#500',
      s: 2 + random() * 3
    })
  }
}
function dmgP(d) {
  if (player.inv > 0 || gameState == 'intro' || player.dd > 0)return;
  player.hp -= d;
  player.inv =.5;
  player.hf =.6;
  screenShake = Math.max(screenShake,
  9);
  SFX.hurt();
  try {
    navigator.vibrate && navigator.vibrate(60)
  } catch (e) {
  }
  blood(player.x,
  player.y,
  8);
  if (MODE == 'train')player.hp = Math.max(player.hp,
  1);
  if (player.hp < player.mh *.2 &&! player.sc20 && player.hp > 0) {
    player.sc20 = 1;
    scare()
  }
  if (player.hp <= 0) {
    player.lives--;
    if (player.lives > 0) {
      player.hp = player.mh;
      player.inv = 2.5;
      player.sn = Math.max(player.sn,
      50);
      player.x = 300;
      player.y = 430;
      player.sc20 = 0;
      say('Kau bangkit... nyawa tersisa ' + player.lives,
      3);
      monsters.forEach(m => {
        if (dist(m,
        player) < 300)m.st = 'patrol'
      })
    } else lose('Kau gugur di desa terkutuk.')
  }
}
function scare() {
  scareEffect = {
    elapsedTime:.55
  };
  SFX.scare();
  screenShake = 16
}
