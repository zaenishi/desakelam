/* ===== MENANG / KALAH ===== */
function fin(t,s,w){if(S=='end')return;S='end';$('#pb').style.display='none';$('#et').textContent=t;$('#et').style.color=w?'#ffd700':'#b30000';
 const tot=score|0;$('#es').innerHTML=s+(MODE=='classic'?`<br>Skor: ${tot} · Artefak ${P.art}/5 · Monster ${P.kills}`:'');
 if(MODE=='classic'){submitScore(tot);$('#es').innerHTML+=`<br>Rank #${getPlayerRank(playerProfile.bestScore)} · Terbaik ${playerProfile.bestScore}`}setTimeout(()=>show('end',1),w?1500:900)}
const win=()=>fin(MODE=='train'?'LATIHAN SELESAI':'KAU SELAMAT',MODE=='train'?'Skin "Penyintas Emas" terbuka!':'Gerbang desa terbuka. Fajar menyambutmu.',1),lose=s=>fin('KAU MATI',s,0);
