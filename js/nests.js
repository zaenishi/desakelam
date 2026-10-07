/* ===== SARANG MONSTER ===== */
function hitN(n, d) {
  n.hp -= d;
  n.fl =.1;
  blood(n.x,
  n.y,
  5);
  SFX.hit();
  if (n.hp <= 0 &&! n.dead) {
    n.dead = 1;
    addScore(40 * night);
    updatePlayerStat('nest',
    1);
    SFX.die();
    screenShake = Math.max(screenShake,
    6);
    say(`Sarang hancur! Tersisa ${monsterNests.filter(q=>!q.dead).length}`,
    2)
  }
}
function drawNest(n) {
  const p = 1 + Math.sin(elapsedTime * 3 + n.elapsedTime) *.08;
  context.save();
  context.translate(n.x,
  n.y);
  context.scale(p,
  p);
  context.fillStyle = '#0008';
  context.beginPath();
  context.ellipse(0,
  14,
  22,
  8,
  0,
  0,
  7);
  context.fill();
  ci(0,
  0,
  18,
  n.fl > 0 ? '#fff': '#2a0a18');
  ci(- 6,
  - 4,
  3,
  '#f22');
  ci(6,
  - 4,
  3,
  '#f22');
  ci(0,
  5,
  5,
  '#400');
  context.restore();
  context.fillStyle = '#000';
  context.fillRect(n.x - 16,
  n.y - 28,
  32,
  4);
  context.fillStyle = '#b00';
  context.fillRect(n.x - 16,
  n.y - 28,
  32 * Math.max(0,
  n.hp / 40),
  4)
}
