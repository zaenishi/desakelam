/* ===== TOURNAMENT ROUND MANAGER ===== */
const Tournament=(()=>{let timer=0,armed=false,ending=false,warningShown=false,startNotice=false;
const cfg=()=>GAME_CONFIG.tournament||{},pad=n=>String(n).padStart(2,'0');
function today(){return localDateKey()}
function parseTime(v){if(v===false||v==null)return null;const m=/^(\d{1,2}):(\d{2})$/.exec(String(v));if(!m)return null;const h=+m[1],mi=+m[2];return h<=23&&mi<=59?{h,mi}:null}
function parseTs(v,day=today()){const p=parseTime(v);if(!p)return null;const d=new Date(`${day}T00:00:00`);d.setHours(p.h,p.mi,0,0);return d.getTime()}
function configured(){if(cfg().enabled===false||cfg().enabledToday===false)return false;const st=parseTime(cfg().startTime||'00:00'),en=parseTime(cfg().endTime);return !!st&&!!en&&(st.h*60+st.mi)<(en.h*60+en.mi)}
function day(){if(!configured())return false;const d=new Date(),dow=d.getDay()||7;return(!cfg().date||cfg().date===today())&&(!Array.isArray(cfg().days)||cfg().days.length===0||cfg().days.includes(dow))}
function startTs(){return parseTs(cfg().startTime||'00:00')}
function endTs(){return parseTs(cfg().endTime)}
function isWithinWindow(now=Date.now()){return day()&&now>=startTs()&&now<endTs()}
function isPastEnd(now=Date.now()){return day()&&now>=endTs()}
function isBeforeStart(now=Date.now()){return day()&&now<startTs()}
function showStartNotice(){if(startNotice||!$('#tournamentStart'))return;startNotice=true;show('tournamentStart',1);const e=$('#tournamentStartInfo');if(e)e.textContent=`Berakhir ${cfg().endTime}`;setTimeout(()=>show('tournamentStart',0),3500)}
function start(){if(timer)return;timer=setInterval(tick,250);tick()}
function stop(){if(timer){clearInterval(timer);timer=0}}
function arm(){if(isWithinWindow()&&!armed){armed=true;warningShown=false;showStartNotice()}}
function disarm(){armed=false;warningShown=false;startNotice=false}
function tick(){if(S==='menu'){const b=$('#tournamentBtn'),st=$('#tournamentStatus');if(b)b.textContent=label();if(st)st.textContent=status()}if(!day()){disarm();return}const now=Date.now();if(isWithinWindow(now)&&S==='play')arm();if(!armed)return;const remain=endTs()-now;if(!warningShown&&remain<=Math.max(1,+cfg().warningMinutes||1)*60000&&remain>0){warningShown=true;warn()}if(now>=endTs())finishSequence()}
function warn(){const el=$('#tournamentWarning');if(!el)return;el.classList.remove('hide');el.textContent='SISA WAKTU 1 MENIT';el.classList.remove('show');void el.offsetWidth;el.classList.add('show');try{tone(440,.5,'square',.2);setTimeout(()=>tone(330,.5,'square',.18),180)}catch(e){}}
async function finishSequence(){if(ending)return;ending=true;stop();try{submitScore(score|0)}catch(e){}S='tournamentEnd';$('#pb').style.display='none';setGameplayControls(false);show('tournamentEnd',1);countdown(+cfg().countdownSeconds||5,async()=>{try{await MLDatabase.refreshLeaderboard()}catch(e){}await delay(700);await winners();cinematic()})}
function countdown(n,done){const el=$('#tCountdown'),title=$('#tCountdownTitle');if(title)title.textContent='TURNAMEN BERAKHIR';let x=n;const step=()=>{if(x<=0){if(el)el.textContent='TURNAMEN HABIS!';try{SFX.bell();}catch(e){}setTimeout(done,1000);return}if(el)el.textContent=x;try{tone(180+x*90,.25,'square',.2)}catch(e){}x--;setTimeout(step,1000)};step()}
async function winners(){const list=(MLDatabase.getLeaderboardSync?MLDatabase.getLeaderboardSync():[]).slice().sort((a,b)=>b.score-a.score).slice(0,+cfg().topWinners||3);if(!list.length){$('#tWinner').innerHTML='<div class="t-rank">BELUM ADA PEMENANG</div>';await delay(1800);return}for(let i=0;i<list.length;i++){const e=list[i],el=$('#tWinner');el.innerHTML=`<div class="t-rank">PEMENANG ${i+1}</div><div class="t-name">${escapeHtml(e.name||'?')}</div><div class="t-score">${e.score||0} POIN · ${escapeHtml(e.uid||'')}</div>`;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');await delay(+cfg().revealDelayMs||2200)}}
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
function cinematic(){show('tournamentEnd',0);show('cleanCinematic',1);const scene=$('#cleanScene'),copy=$('#cleanCopy');if(scene)scene.className='clean-scene dirty';if(copy)copy.textContent='Sampah telah dibersihkan...';setTimeout(()=>{if(scene)scene.className='clean-scene clean';if(copy)copy.textContent='Desa kembali cerah. Warga kembali tersenyum.'},2600);setTimeout(()=>{if(copy)copy.textContent='Menjaga lingkungan adalah tugas kita bersama.'},5200);setTimeout(()=>finish(),7800)}
function finish(){ending=false;armed=false;warningShown=false;start();show('cleanCinematic',0);show('tournamentEnd',0);M=[];IT=[];PR=[];FX=[];TX=[];score=0;night=1;wave=0;boss=0;if(cfg().redirectToLeaderboard)openRanking();else toMenu()}
function label(){return'START'}
function status(){if(!configured())return'';if(isPastEnd())return'Turnamen hari ini selesai';if(isBeforeStart())return`Mulai ${cfg().startTime}`;return`Turnamen mode · ${Math.max(0,Math.ceil((endTs()-Date.now())/1000))} detik`}
function escapeHtml(v){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
return Object.freeze({start,stop,tick,armIfPlaying:arm,disarm,isWithinWindow,isPastEnd,getMenuLabel:label,getStatusText:status})})();
