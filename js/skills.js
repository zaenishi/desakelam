/* ===== SKILL KARAKTER ===== */
const ring =(c, r) => effects.push({
  k:'ring', x:player.x, y:player.y, r, c, t:.4
});
function skill() {
  if(player.scd > 0) {
    say('SKILL COOLDOWN ' + player.scd.toFixed(1) + 's', 1.2);
    return;
  }
  const c = getCurrentCharacterClass();
  const aoe =(r, d) => {
    monsters.forEach(m => {
      if(m.st != 'death' && distanceBetween(m, player) < r + m.r)hurtM(m, d, 1)
    });
    spawnedMonsterNests.forEach(n => {
      if(Math.hypot(n.x - player.x, n.y - player.y) < r)hitN(n, d)
    })
  };
  player.scd =(c.skillCooldown ?? c.cd ?? 0) *((GAME_CONFIG.gameplay && GAME_CONFIG.gameplay.skillCooldownMultiplier) || 1);
  SFX.crit();
  screenShake = Math.max(screenShake, 8);
  if(c.id == 'kn') {
    player.inv = 2;
    aoe(100, 25);
    ring('#8cf', 100)
  } else if(c.id == 'ma') {
    aoe(170, 40);
    ring('#c6f', 170)
  } else if(c.id == 'ar') {
    for(let i = - 2; i <= 2; i++) {
      const a = player.face + i * .18;
      projectiles.push({
        f:1, x:player.x, y:player.y, vx:Math.cos(a) * 520, vy:Math.sin(a) * 520, t:.8, d:20
      })
    }
  } else if(c.id == 'ro') {
    let b = null,
    bd = 260;
    monsters.forEach(m => {
      const d = distanceBetween(m, player); if(m.st != 'death' && d < bd) {
        bd = d; b = m
      }
    });
    if(b) {
      const a = Math.atan2(b.y - player.y, b.x - player.x);
      player.x = clampValue(b.x - Math.cos(a) * 30, 15, worldWidthValue - 15);
      player.y = clampValue(b.y - Math.sin(a) * 30, 15, worldHeightValue - 15);
      hurtM(b, 55, 1);
      player.inv = .6
    } else player.scd = 1
  } else if(c.id == 'pr') {
    player.hp = Math.min(player.mh, player.hp + 35);
    player.sn = Math.min(100, player.sn + 30);
    aoe(120, 15);
    ring('#ff8', 120)
  } else {
    player.rage = 6;
    ring('#f60', 90)
  }
}
