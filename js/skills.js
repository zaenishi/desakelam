/* ===== SKILL KARAKTER (dipengaruhi upgrade EduShop) ===== */
const ring = (c, r) => FX.push({ k: 'ring', x: P.x, y: P.y, r, c, t: .4 });
function skill() {
  if (P.scd > 0) { say('SKILL COOLDOWN ' + P.scd.toFixed(1) + 's', 1.2); return; }
  const c = getCurrentCharacterClass(), u = Loadout.skill();
  const aoe = (r, d, stun) => {
    M.forEach(m => { if (m.st != 'death' && dist(m, P) < r + m.r) { hurtM(m, d, 1); if (stun) stunM(m, stun); } });
    NS.forEach(n => { if (Math.hypot(n.x - P.x, n.y - P.y) < r) hitN(n, d); });
  };
  P.scd = c.skillCooldown * ((GAME_CONFIG.gameplay && GAME_CONFIG.gameplay.skillCooldownMultiplier) || 1) * u.cd;
  SFX.crit(); shake = Math.max(shake, 8);
  if (c.id == 'kn') { P.inv = 2 * u.dur; aoe(100 * u.rng, 25 * u.pow, .8 * u.dur); ring('#8cf', 100 * u.rng); FX.push({ k: 'ring', x: P.x, y: P.y, r: 60, c: '#fff', t: .4 }); }
  else if (c.id == 'ma') {
    aoe(170 * u.rng, 40 * u.pow, 2 * u.dur); ring('#c6f', 170 * u.rng); ring('#6fe6ff', 120 * u.rng);
    for (let i = 0; i < 18; i++) { const a = R() * 7, v = 60 + R() * 200; FX.push({ k: 'p', x: P.x, y: P.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: .7, c: i % 2 ? '#c6f' : '#6fe6ff', s: 4 }); }
  } else if (c.id == 'ar') {
    for (let i = -2; i <= 2; i++) { const a = P.face + i * .18; shootP(a, { kind: 'arrow', vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, t: .9, d: 20 * u.pow, pi: 3, c: '#bff0a0' }); }
  } else if (c.id == 'ro') {
    const b = nearestMonster(260);
    if (b) {
      const a = Math.atan2(b.y - P.y, b.x - P.x);
      for (let i = 0; i < 10; i++) FX.push({ k: 'p', x: P.x, y: P.y, vx: R() * 80 - 40, vy: R() * 80 - 40, t: .5, c: '#7a2a4a', s: 5 });
      P.x = cl(b.x - Math.cos(a) * 30, 15, WW - 15); P.y = cl(b.y - Math.sin(a) * 30, 15, WH - 15);
      hurtM(b, 55 * u.pow, 1); P.inv = .6 * u.dur; FX.push({ k: 'stab', x: b.x, y: b.y, t: .25 });
    } else P.scd = 1;
  } else if (c.id == 'pr') {
    P.hp = Math.min(P.mh, P.hp + 35 * u.pow); P.sn = Math.min(100, P.sn + 30); aoe(120 * u.rng, 15 * u.pow, .6 * u.dur); ring('#ff8', 120 * u.rng);
    for (let i = 0; i < 8; i++) TX.push({ s: '+', x: P.x + R() * 60 - 30, y: P.y - R() * 30, t: 1, c: '#7dff7d', z: 18 });
  } else { P.rage = 6 * u.dur; ring('#f60', 90); ring('#fa0', 50); }
}
