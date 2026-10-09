/* ===== MENANG / KALAH ===== */
function fin(title,sub,win){
  if(S=='end'||S=='cine'||S=='tend')return;
  $('#et').textContent=title;$('#et').style.color=win?'#ffd700':'#b30000';
  const tot=score|0;
  $('#es').innerHTML=sub+(MODE=='classic'?`<br>Skor: ${tot} · Artefak ${P.art}/5 · Monster Sampah ${P.kills}`:'');
  if(MODE=='classic'){submitScore(tot);$('#es').innerHTML+=`<br>Rank ${rankText(playerProfile.bestScore)} · Terbaik ${playerProfile.bestScore}`}
  if(win&&typeof Cinematic!=='undefined')Cinematic.play(()=>UI.set(END_STATE,{delay:0}));
  else UI.set(END_STATE,{delay:win?1500:900});
}
const win=()=>fin(MODE=='train'?'LATIHAN SELESAI':'KAU SELAMAT',MODE=='train'?'Skin "Penyintas Emas" terbuka!':'Gerbang desa terbuka. Fajar menyambutmu.',1),lose=s=>fin('KAU MATI',s,0);
