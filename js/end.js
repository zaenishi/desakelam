/* ===== MENANG / KALAH ===== */
function fin(t, s, w) {
  if (gameState == 'end')return;
  gameState = 'end';
  querySelector('#pb').style.display = 'none';
  querySelector('#et').textContent = t;
  querySelector('#et').style.color = w ? '#ffd700': '#b30000';
  const tot = score | 0;
  querySelector('#es').innerHTML = s + (MODE == 'classic' ? `<br>Skor: ${tot} · Artefak ${player.art}/5 · Monster ${player.kills}`: '');
  if (MODE == 'classic') {
    submitScore(tot);
    querySelector('#es').innerHTML += `<br>Rank #${getPlayerRank(playerProfile.bestScore)} · Terbaik ${playerProfile.bestScore}`
  }
  setTimeout(() => show('end',
  1),
  w ? 1500: 900)
}
const win = () => fin(MODE == 'train' ? 'LATIHAN SELESAI': 'KAU SELAMAT', MODE == 'train' ? 'Skin "Penyintas Emas" terbuka!': 'Gerbang desa terbuka. Fajar menyambutmu.', 1), lose = s => fin('KAU MATI', s, 0);
