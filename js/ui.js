/* ===== UI / NAVIGATION ===== */
function setGameplayControls(active){const tc=$('#tc');if(tc){tc.style.display=active&&touch?'block':'none';tc.classList.toggle('active',!!(active&&touch))}const pb=$('#pb');if(pb)pb.style.display=active?'block':'none';const bi=$('#bI');if(bi)bi.style.display=active&&touch?'block':'none';if(!active&&typeof resetJoystickVisual==='function'){jx=jy=0;resetJoystickVisual()}}
document.addEventListener('click',e=>{
 const cc=e.target.closest?.('.chc');if(cc){SFX.click();selectCharacter(+cc.dataset.i);return}
 const b=e.target.closest?.('.b');if(!b)return;SFX.click();const r=document.createElement('i'),q=b.getBoundingClientRect();r.className='rp';r.style.left=e.clientX-q.left-5+'px';r.style.top=e.clientY-q.top-5+'px';b.appendChild(r);setTimeout(()=>r.remove(),600);
 const a=b.dataset.a;
 if(a==='train'||a==='classic')begin(a);else if(a==='again')begin(MODE);else if(a==='home')toMenu();else if(a==='resume')pauseT();else if(a==='rank')openRanking();else if(a==='prof')openProfile();else if(a==='credits')openCredits();else if(a==='shop')shopOpen();else if(a==='close')toMenu();else if(a==='gate')submitAccessCode();else if(a==='reg')submitRegistration();else if(a==='edit')showRegistration()
});
document.addEventListener('pointerover',e=>{if(e.target.closest?.('.b'))SFX.hover()});
const show=(id,v)=>{const e=$('#'+id);if(e)e.classList.toggle('hide',!v)};
function pauseT(){if(S==='play'){S='pause';show('pause',1);setGameplayControls(false);SFX.back()}else if(S==='pause'){S='play';show('pause',0);setGameplayControls(true)}}
$('#pb').onclick=pauseT;
$('#sk').onclick=()=>{if(S==='intro')endIntro()};
function renderLB(){const c=getCurrentCharacterClass();$('#mi').textContent=playerProfile.name?`${escapeHtml(playerProfile.name)} · ${escapeHtml(playerProfile.uid)}`:'PEMAIN';$('#lb').innerHTML=playerProfile.name?`<span>Skor terbaik <b>${playerProfile.bestScore}</b></span>`:'';if(typeof Tournament!=='undefined'){const b=$('#tournamentBtn');if(b){const title=b.querySelector('strong');if(title)title.textContent=Tournament.getMenuLabel();else b.textContent=Tournament.getMenuLabel()}const st=$('#tournamentStatus');if(st)st.textContent=Tournament.getStatusText();const ss=$('#startSub');if(ss)ss.textContent=Tournament.isWithinWindow()?`TURNAMEN MODE · ${Tournament.getStatusText().replace('Aktif · ','')}`:''}}
function toMenu(){if(S==='pause'&&MODE==='classic'&&P)submitScore(score|0);S='menu';['pause','end','load','gate','reg','rank','prof','credits','shop','tournamentEnd','tournamentStart'].forEach(i=>show(i,0));show('menu',1);setGameplayControls(false);$('#sk').style.display='none';$('#tc').style.display='none';$('#bI').style.display='none';renderLB()}
function endIntro(){if(S!=='intro')return;S='menu';M=[];slow=1;$('#sk').style.display='none';routePlayer()}
function begin(m){I={};K.__d=0;ab=db=eb=sb=fb=0;jx=jy=0;S='load';show('menu',0);show('end',0);show('rank',0);show('prof',0);show('shop',0);show('load',1);$('#tip').textContent=TIPS[R()*TIPS.length|0];SFX.door();const bar=$('#bar i');bar.style.transition='none';bar.style.width='0';requestAnimationFrame(()=>{bar.style.transition='width 1.6s';bar.style.width='100%'});setTimeout(()=>{reset(m);if(m==='classic'){playerProfile.gamesPlayed++;savePlayerProfile()}S='play';show('load',0);setGameplayControls(true);$('#sk').style.display='none';last=performance.now()},1700)}
function openCredits(){show('menu',0);$('#creditsNames').innerHTML=(GAME_CONFIG.ui.credits||[]).map(escapeHtml).map(n=>`<div>${n}</div>`).join('');show('credits',1)}
function closeCredits(){show('credits',0);show('menu',1);S='menu';renderLB()}
