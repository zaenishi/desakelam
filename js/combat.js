/* ===== COMBAT — serangan unik per karakter ===== */
const weaponMods = () => (typeof Loadout !== 'undefined' ? Loadout.mods() : { dmg: 1, range: 1, rate: 1, color: null });
const playerDmg = base => base * getCurrentCharacterClass().damageMultiplier * (P.rage > 0 ? 2 : 1) * weaponMods().dmg;

function nearestMonster(maxD, from = P) {
  let best = null, bd = maxD;
  for (const m of M) if (m.st != 'death') { const d = dist(from, m); if (d < bd) { bd = d; best = m; } }
  return best;
}
/* Stun monster sampah (boss hanya 40% efektif). */
function stunM(m, sec) {
  if (!m || m.st == 'death') return;
  if (m.boss || m.k == 'wo') sec *= .4;
  m.stun = Math.max(m.stun || 0, sec);
  if (m.st == 'attack' || m.st == 'alert') go(m, 'chase');
  m.dash = 0;
  for (let i = 0; i < 4; i++) FX.push({ k: 'p', x: m.x, y: m.y - m.r, vx: R() * 80 - 40, vy: -R() * 60, t: .4, c: '#ffd54a', s: 3 });
}
/* Proyektil milik pemain. */
function shootP(a, o) {
  PR.push(Object.assign({ f: 1, kind: 'arrow', x: P.x + Math.cos(a) * 14, y: P.y + Math.sin(a) * 14, vx: Math.cos(a) * 600, vy: Math.sin(a) * 600, t: .75, d: 10, pi: 0, rad: 6, c: '#fff', hit: [] }, o));
}
function updateProjectile(p, dt) {
  if (p.f && p.home) {
    const m = nearestMonster(280, p);
    if (m) {
      const sp = Math.hypot(p.vx, p.vy), cur = Math.atan2(p.vy, p.vx), want = Math.atan2(m.y - p.y, m.x - p.x);
      const na = cur + cl(angd(want, cur), -p.home * dt * 6, p.home * dt * 6);
      p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
    }
  }
  p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt;
  if (p.f) {
    if (hitO(p.x, p.y, 2) && p.kind != 'holy') { p.t = 0; return; }
    for (const m of M) {
      if (m.st == 'death' || p.hit.includes(m)) continue;
      if (Math.hypot(p.x - m.x, p.y - m.y) < m.r + p.rad) { onProjectileHit(p, m); if (p.pi > 0) { p.pi--; p.hit.push(m); } else { p.t = 0; } return; }
    }
    for (const n of NS) if (!n.dead && Math.hypot(p.x - n.x, p.y - n.y) < 24) { hitN(n, p.d); p.t = 0; return; }
  } else if (Math.hypot(p.x - P.x, p.y - P.y) < P.r + 6) { dmgP(p.d); p.t = 0; }
}
function onProjectileHit(p, m) {
  hurtM(m, p.d, p.crit);
  if (p.stun) stunM(m, p.stun);
  if (p.sp) {
    FX.push({ k: 'ring', x: m.x, y: m.y, r: p.sp, c: p.c, t: .4 });
    for (const o of M) if (o !== m && o.st != 'death' && dist(o, m) < p.sp + o.r) { hurtM(o, p.d * .6, 0); if (p.stun) stunM(o, p.stun); }
  }
  if (p.heal) { P.hp = Math.min(P.mh, P.hp + p.heal); TX.push({ s: '+' + p.heal, x: P.x, y: P.y - 34, t: .8, c: '#8f8', z: 12 }); }
  hitstop = Math.max(hitstop, .03); shake = Math.max(shake, 3);
}

function atk() {
  const c = getCurrentCharacterClass(), A = c.attack, wm = weaponMods();
  if (P.cd > 0 || P.st < A.stamina || P.dd > 0) return;
  P.cd = A.cooldown * wm.rate; P.at = .22; P.st -= A.stamina; P.noise = .6; P.swings++;
  const ranged = A.type == 'arrow' || A.type == 'bolt' || A.type == 'holy';
  const b = nearestMonster(ranged ? A.range : 170);
  if (b) P.face = Math.atan2(b.y - P.y, b.x - P.x);
  P.cmT = 1.2; P.cmb++; const crit = P.cmb >= 3; if (crit) P.cmb = 0;
  let hit = 0;
  const dmg = playerDmg(A.damage), col = wm.color;
  const range = (A.range || 0) * wm.range;

  if (A.type == 'slash') {
    SFX.swing();
    for (const m of M) {
      if (m.st == 'death') continue; const d = dist(P, m);
      if (d < range + m.r && (d < m.r + 22 || Math.abs(angd(Math.atan2(m.y - P.y, m.x - P.x), P.face)) < A.arc)) { hurtM(m, dmg * (crit ? 2 : 1), crit); hit = 1; }
    }
    NS.forEach(n => { if (Math.hypot(n.x - P.x, n.y - P.y) < 95 * wm.range) { hitN(n, dmg * (crit ? 2 : 1)); hit = 1; } });
    FX.push({ k: 'slash', x: P.x, y: P.y, a: P.face, t: .22, c: crit, col, rad: 70 * wm.range });
    FX.push({ k: 'ring', x: P.x + Math.cos(P.face) * 50, y: P.y + Math.sin(P.face) * 50, r: 46, c: col || '#9bf', t: .3 });
  } else if (A.type == 'cleave') {
    SFX.swing(); SFX.hit();
    for (const m of M) { if (m.st == 'death') continue; if (dist(P, m) < range + m.r) { hurtM(m, dmg * (crit ? 2 : 1), crit); hit = 1; } }
    NS.forEach(n => { if (Math.hypot(n.x - P.x, n.y - P.y) < range + 10) { hitN(n, dmg * (crit ? 2 : 1)); hit = 1; } });
    FX.push({ k: 'spin', x: P.x, y: P.y, t: .32, c: crit, col, rad: range });
    shake = Math.max(shake, 6);
  } else if (A.type == 'stab') {
    SFX.swing();
    for (const m of M) {
      if (m.st == 'death') continue; const d = dist(P, m);
      if (d < range + m.r && (d < m.r + 16 || Math.abs(angd(Math.atan2(m.y - P.y, m.x - P.x), P.face)) < A.arc)) { hurtM(m, dmg * A.hits * (crit ? 2 : 1), crit); hit = 1; FX.push({ k: 'stab', x: m.x, y: m.y, t: .2, col }); }
    }
    NS.forEach(n => { if (Math.hypot(n.x - P.x, n.y - P.y) < range + 20) { hitN(n, dmg * A.hits); hit = 1; } });
    FX.push({ k: 'dagger', x: P.x, y: P.y, a: P.face, t: .16, col });
  } else if (A.type == 'arrow') {
    SFX.shoot();
    shootP(P.face, { kind: 'arrow', vx: Math.cos(P.face) * 640, vy: Math.sin(P.face) * 640, t: A.range / 640, d: dmg * (crit ? 2 : 1), pi: A.pierce || 0, c: col || '#e8e8e8', crit });
  } else if (A.type == 'bolt') {
    SFX.zap();
    P.el = (P.el + 1) % 2; const ice = P.el == 1;
    shootP(P.face, { kind: ice ? 'ice' : 'fire', vx: Math.cos(P.face) * 360, vy: Math.sin(P.face) * 360, t: A.range / 360, rad: 9, d: dmg * (ice ? .7 : 1) * (crit ? 2 : 1), sp: A.splash * wm.range, stun: ice ? .8 : 0, c: ice ? '#6fe6ff' : '#ff8a2a', crit });
  } else if (A.type == 'holy') {
    SFX.shoot();
    shootP(P.face, { kind: 'holy', vx: Math.cos(P.face) * 280, vy: Math.sin(P.face) * 280, t: A.range / 280, rad: 8, d: dmg * (crit ? 2 : 1), home: .7, heal: 1, c: col || '#ffe066', crit });
  }
  if (crit) updatePlayerStat('crit', 1);
  if (crit) { FX.push({ k: 'bolt', x: P.x + Math.cos(P.face) * 90, y: P.y + Math.sin(P.face) * 90, t: .25 }); TX.push({ s: 'CRITICAL!', x: P.x, y: P.y - 50, t: 1, c: '#f33', z: 20 }); }
  if (hit) { hitstop = crit ? .1 : .05; shake = Math.max(shake, crit ? 10 : 5); }
}

function hurtM(m, d, crit) {
  if (m.k == 'sh') d *= 1.5;
  m.hp -= d; m.fl = .1;
  const a = Math.atan2(m.y - P.y, m.x - P.x), kb = m.k == 'wo' || m.k == 'bo' ? 120 : 260;
  m.kx = Math.cos(a) * kb; m.ky = Math.sin(a) * kb;
  TX.push({ s: Math.round(d), x: m.x, y: m.y - m.r - 10, t: .9, c: crit ? '#f22' : '#fff', z: crit ? 22 : 13 });
  blood(m.x, m.y, crit ? 14 : 7, m.t.b); (crit ? SFX.crit : SFX.hit)(); FX.push({ k: 'spark', x: m.x, y: m.y, t: .15 });
  if (m.hp <= 0) {
    m.st = 'death'; m.stt = 0; SFX.die(); P.kills++;
    addScore(m.guard ? 80 + m.mh | 0 : 8 + (m.mh / 3 | 0)); P.sk++; P.skT = 5;
    updatePlayerStat('kills', 1); updatePlayerStat('combo', P.sk, 1); if (m.boss) updatePlayerStat('boss', 1);
    if (m.guard) { IT.push({ k: 'art', x: m.x, y: m.y }); say('Artefak jatuh dari penjaga!', 3); }
    else if (R() < .15) IT.push({ k: 'med', x: m.x, y: m.y });
    if (m.k == 'wo' && m.boss) newNight(1500 * night, 'Gerbang terbuka!');
    if (m.guard || m.boss || !M.some(q => q != m && q.st != 'death' && q.st == 'chase')) { slow = .3; shake = Math.max(shake, 8); }
  } else if (m.k != 'wo' || m.hp < m.mh * .5) { m.st = 'hurt'; m.stt = 0; }
}
function blood(x, y, n, pal) {
  const cols = pal || ['#a00', '#500'];
  for (let i = 0; i < n; i++) { const a = R() * 7, v = 40 + R() * 160; FX.push({ k: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: .5 + R() * .4, c: cols[R() * cols.length | 0], s: 2 + R() * 3 }); }
}
function dmgP(d) {
  if (P.inv > 0 || S == 'intro' || P.dd > 0) return;
  P.hp -= d; P.inv = .5; P.hf = .6; shake = Math.max(shake, 9); SFX.hurt();
  Device.vibrate(60);
  blood(P.x, P.y, 8);
  if (MODE == 'train') P.hp = Math.max(P.hp, 1);
  if (P.hp < P.mh * .2 && !P.sc20 && P.hp > 0) { P.sc20 = 1; scare(); }
  if (P.hp <= 0) {
    P.lives--;
    if (P.lives > 0) { P.hp = P.mh; P.inv = 2.5; P.sn = Math.max(P.sn, 50); P.x = 300; P.y = 430; P.sc20 = 0; say('Kau bangkit... nyawa tersisa ' + P.lives, 3); M.forEach(m => { if (dist(m, P) < 300) m.st = 'patrol'; }); }
    else lose('Kau gugur di desa terkutuk.');
  }
}
function scare() { sc = { t: .55 }; SFX.scare(); shake = 16; }
