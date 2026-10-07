/* ===== UI ===== */
document.addEventListener('click',e=>{const cc=e.target.closest('.chc');if(cc){SFX.click();selectCharacter(+cc.dataset.i);return}const b=e.target.closest('.b');if(!b)return;SFX.click();const r=document.createElement('i'),q=b.getBoundingClientRect();r.className='rp';r.style.left=e.clientX-q.left-5+'px';r.style.top=e.clientY-q.top-5+'px';b.appendChild(r);setTimeout(()=>r.remove(),600);
 const a=b.dataset.a;if(a=='train'||a=='classic')begin(a);if(a=='again')begin(MODE);if(a=='home')toMenu();if(a=='resume')pauseT();if(a=='rank')openRanking();if(a=='prof')openProfile();if(a=='close')toMenu();if(a=='credits')openCredits();if(a=='fullscreen')requestGameFullscreen();if(a=='landscape')requestLandscape();if(a=='gate')submitAccessCode();if(a=='reg')submitRegistration();if(a=='edit')showRegistration()});
document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('.b'))SFX.hover()});
const show=(id,v)=>$('#'+id).classList.toggle('hide',!v);
function pauseT(){if(S=='play'){S='pause';show('pause',1);SFX.back()}else if(S=='pause'){S='play';show('pause',0)}}
$('#pb').onclick=pauseT;$('#sk').onclick=()=>{if(S=='intro')endIntro()};
function renderLB(){const c=getCurrentCharacterClass();$('#mi').textContent=playerProfile.name?`${escapeHtml(playerProfile.name)} - ${escapeHtml(playerProfile.uid)} [${escapeHtml(c.name)}]`:'';$('#lb').innerHTML=playerProfile.name?`Skor terbaik <b style="color:#ffd700">${playerProfile.bestScore}</b> · Rank #${getPlayerRank(playerProfile.bestScore)}`+(playerProfile.skinUnlocked?' · Skin emas':''):''};if(typeof Tournament!=='undefined'){const b=$('#tournamentBtn');if(b)b.textContent=Tournament.getMenuLabel();const st=$('#tournamentStatus');if(st)st.textContent=Tournament.getStatusText()}
function toMenu(){if(S=='pause'&&MODE=='classic'&&P)submitScore(score|0);S='menu';['pause','end','load','gate','reg','rank','prof'].forEach(i=>show(i,0));show('menu',1);$('#pb').style.display='none';$('#bI').style.display='none';$('#tc').style.display='';renderLB()}
function endIntro(){if(S!='intro')return;S='menu';M=[];slow=1;$('#sk').style.display='none';routePlayer()}
function begin(m){S='load';show('menu',0);show('end',0);show('load',1);$('#tip').textContent=TIPS[R()*TIPS.length|0];SFX.door();const bar=$('#bar i');bar.style.transition='none';bar.style.width='0';requestAnimationFrame(()=>{bar.style.transition='width 1.6s';bar.style.width='100%'});
 setTimeout(()=>{reset(m);if(m=='classic'){playerProfile.gamesPlayed++;savePlayerProfile()}S='play';show('load',0);$('#pb').style.display='block';$('#tc').style.display=touch?'block':'';last=performance.now()},1700)}

function openCredits(){show('menu',0);$('#creditsNames').innerHTML=(GAME_CONFIG.ui.credits||[]).map(escapeHtml).map(n=>`<div>${n}</div>`).join('');show('credits',1)}
function closeCredits(){show('credits',0);toMenu()}
