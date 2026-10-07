/* ===== MALAM BERIKUTNYA (ENDLESS) ===== */
function newNight(b, txt) {
  if (isInsideInterior)leave();
  score += b;
  updatePlayerStat('night',
  night,
  1);
  night++;
  gameTime = 0;
  currentWave = 0;
  waveTimer = 20;
  bossActive = 0;
  player.art = 0;
  player.hp = Math.min(player.mh,
  player.hp + 40);
  player.sn = Math.min(100,
  player.sn + 30);
  SFX.lvl();
  popC();
  say(`${txt} Malam ${night}: monster lebih kuat!`,
  5);
  fadeAmount = 1;
  savePlayerProfile()
}
