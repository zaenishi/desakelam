/* ===== MUSIK BERLAPIS ===== */
function mus(dt) {
  if (!audioContext)return;
  runtimeState.pd = (runtimeState.pd || 0) - dt;
  if (runtimeState.pd <= 0) {
    runtimeState.pd = 4;
    const b = [55,
    65.4,
    49][(elapsedTime / 4 | 0) % 3];
    [1,
    1.5,
    2].forEach(m => tone(b * m,
    4.5,
    'triangle',
    .05))
  }
  if (bossActive) {
    runtimeState.ch = (runtimeState.ch || 0) - dt;
    if (runtimeState.ch <= 0) {
      runtimeState.ch = 2;
      [220,
      277,
      330].forEach(f => tone(f,
      2,
      'sawtooth',
      .04))
    }
  }
}
