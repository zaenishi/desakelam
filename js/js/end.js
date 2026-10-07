/* ===== MENANG / KALAH ===== */
function fin(t, s, w) {
  if(gameState == 'end')return;
  gameState = 'end';
  domQuery('#pb').style.display = 'none';
  domQuery('#et').textContent = t;
  domQuery('#et').style.color = w?'#ffd700':'#b30000';
  const tot = score|0;
  domQuery('#es').innerHTML = s +(gameMode == 'classic'?`<br>Skor: ${tot} · Artefak ${player.art}/5 · Monster ${player.kills}`:'');
  if(gameMode == 'classic') {
    submitScore(tot);
    domQuery('#es').innerHTML += `<br>Rank #${getPlayerRank(playerProfile.bestScore)} · Terbaik ${playerProfile.bestScore}`
  }
  setTimeout(() => show('end', 1), w?1500:900)
}
const win =() => fin(gameMode == 'train'?'LATIHAN SELESAI':'KAU SELAMAT', gameMode == 'train'?'Skin "Penyintas Emas" terbuka!':'Gerbang desa terbuka. Fajar menyambutmu.', 1), lose = s => fin('KAU MATI', s, 0);
