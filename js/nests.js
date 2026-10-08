/* ===== SARANG MONSTER ===== */
function hitN(n, d) {
  n.hp -= d;
  n.fl = .1;
  blood(n.x, n.y, 5);
  SFX.hit();
  if(n.hp <= 0 && !n.dead) {
    n.dead = 1;
    addScore(40 * night);
    updatePlayerStat('nest', 1);
    SFX.die();
    screenShake = Math.max(screenShake, 6);
    say(`Sarang hancur! Tersisa ${spawnedMonsterNests.filter(q=>!q.dead).length}`, 2)
  }
}
function drawNest(n) {
  const p = 1 + Math.sin(t * 3 + n.t) * .08;
  gameCanvasContext.save();
  gameCanvasContext.translate(n.x, n.y);
  gameCanvasContext.scale(p, p);
  gameCanvasContext.fillStyle = '#0008';
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse(0, 14, 22, 8, 0, 0, 7);
  gameCanvasContext.fill();
  fillCircle(0, 0, 18, n.fl > 0?'#fff':'#2a0a18');
  fillCircle( - 6, - 4, 3, '#f22');
  fillCircle(6, - 4, 3, '#f22');
  fillCircle(0, 5, 5, '#400');
  gameCanvasContext.restore();
  gameCanvasContext.fillStyle = '#000';
  gameCanvasContext.fillRect(n.x - 16, n.y - 28, 32, 4);
  gameCanvasContext.fillStyle = '#b00';
  gameCanvasContext.fillRect(n.x - 16, n.y - 28, 32 * Math.max(0, n.hp / 40), 4)
}
