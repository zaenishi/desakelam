/* ===== MONSTER AI ===== */
function mvE(e, dx, dy, f) {
  const nx = clampValue(e.x + dx, e.r, worldWidthValue - e.r),
  ny = clampValue(e.y + dy, e.r, worldHeightValue - e.r);
  if(f || !hitO(nx, e.y, e.r))e.x = nx;
  if(f || !hitO(e.x, ny, e.r))e.y = ny
}
const go =(m, s) => {
  m.st = s;
  m.stt = 0
};
function upM(m, dt) {
  const d0 = distanceBetween(player, m) || 1,
  a = Math.atan2(player.y - m.y, player.x - m.x),
  T_ = m.t,
  sp = T_.s * m.spd *(weather == 'rain'?.9:weather == 'storm'?1.1:1) *(1 + waveNumber * .03);
  m.stt += dt;
  m.cd -= dt;
  m.fl -= dt;
  if(m.st == 'death') {
    if(m.stt > .7)m.dead = 1;
    return
  }
  if(m.st == 'hurt') {
    mvE(m, m.kx * dt, m.ky * dt, T_.fly);
    m.kx *= .88;
    m.ky *= .88;
    if(m.stt > .25)go(m, 'chase');
    return
  }
  const sight = weather == 'fog'?150:300;
  if(m.st == 'idle' || m.st == 'patrol') {
    if(m.st == 'idle' && m.stt > 1.5) {
      go(m, 'patrol');
      m.pa = randomValue() * 7
    }
    if(m.st == 'patrol') {
      mvE(m, Math.cos(m.pa) * 30 * dt, Math.sin(m.pa) * 30 * dt, T_.fly);
      m.face = m.pa;
      if(m.stt > 2.2)go(m, 'idle')
    }
    if(d0 < sight *(player.sn < 30?1.3:1) ||(player.noise > 0 && d0 < 230)) {
      go(m, 'alert');
      m.face = a;
      SFX.growl()
    }
    return
  }
  m.face = a;
  if(m.st == 'alert') {
    if(m.stt > .5)go(m, 'chase');
    return
  }
  if(m.st == 'attack') {
    if(m.stt > .45) {
      if(d0 < m.r + player.r + 30)dmgP(T_.d *(1 + waveNumber * .05) *(m.sc > 1?1.2:1));
      m.cd = 1.1;
      go(m, 'chase')
    }
    return
  }
  if(m.dash > 0) {
    m.dash -= dt;
    mvE(m, Math.cos(m.da) *(m.k == 'wo'?480:400) * dt, Math.sin(m.da) *(m.k == 'wo'?480:400) * dt, T_.fly);
    if(d0 < m.r + player.r + 8 && m.cd <= 0) {
      go(m, 'attack')
    }
    return
  }
  if(d0 > sight * 1.9) {
    go(m, 'patrol');
    return
  }
  if(m.k == 'sp' && m.hp < m.mh * .25 && d0 < 200) {
    mvE(m, - Math.cos(a) * sp * dt, - Math.sin(a) * sp * dt);
    return
  }
  if(m.k == 'sh' && m.cd <= 0 && d0 > 130) {
    const q = randomValue() * 7;
    m.x = clampValue(player.x + Math.cos(q) * 90, 20, worldWidthValue - 20);
    m.y = clampValue(player.y + Math.sin(q) * 90, 20, worldHeightValue - 20);
    if(hitO(m.x, m.y, m.r)) {
      m.x = player.x + 120;
      m.y = player.y
    }
    m.cd = 4;
    blood(m.x, m.y, 6);
    return
  }
  if(m.k == 'sp' && m.cd <= 0 && d0 < 200) {
    m.dash = .25;
    m.da = a;
    m.cd = 3;
    return
  }
  if(m.k == 'wo') {
    if(m.cd <= 0 && d0 < 320 && d0 > 90) {
      m.dash = .3;
      m.da = a;
      m.cd = 3.5;
      return
    }
    if(m.hp < m.mh * .5 && !m.howl) {
      m.howl = 1;
      monsters.forEach(q => q.spd = 1.25);
      SFX.howl();
      screenShake = 10;
      say('Serigala melolong! Monster mengamuk!', 3)
    }
    if(m.hp < m.mh)m.hp = Math.min(m.mh, m.hp + 2 * dt)
  }
  if(m.k == 'gh' && d0 < 300) {
    if(m.cd <= 0) {
      m.cd = 2;
      projectiles.push({
        x:m.x, y:m.y, vx:Math.cos(a) * 170, vy:Math.sin(a) * 170, t:3, d:T_.d
      });
      SFX.growl()
    }
    if(d0 > 140)mvE(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, 1);
    return
  }
  if(d0 < m.r + player.r + 14 && m.cd <= 0) {
    go(m, 'attack');
    return
  }
  if(d0 > m.r + player.r + 4) {
    let ax = Math.cos(a),
    ay = Math.sin(a);
    const nx = m.x + ax * sp * dt * 3,
    ny = m.y + ay * sp * dt * 3;
    if(!T_.fly && hitO(nx, ny, m.r)) {
      const q = a +(m.pa > 3?1: - 1) * 1.2;
      ax = Math.cos(q);
      ay = Math.sin(q)
    }
    mvE(m, ax * sp * dt, ay * sp * dt, T_.fly)
  }
}
