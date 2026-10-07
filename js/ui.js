/* ===== UI ===== */
document.addEventListener('click',e=>{const cc=e.target.closest('.chc');if(cc){SFX.click();selectCharacter(+cc.dataset.i);return}const b=e.target.closest('.b,[data-a]');if(!b)return;SFX.click();const r=document.createElement('i'),q=b.getBoundingClientRect();r.className='rp';r.style.left=e.clientX-q.left-5+'px';r.style.top=e.clientY-q.top-5+'px';b.appendChild(r);setTimeout(()=>r.remove(),600);
 const a=b.dataset.a;if(a=='train'||a=='classic')begin(a);if(a=='again')begin(MODE);if(a=='home')toMenu();if(a=='resume')pauseT();if(a=='rank')openRanking();if(a=='prof')openProfile();if(a=='close'){toMenu();}if(a=='credits')openCredits();if(a=='arsenal')openArsenal();if(a=='closeArsenal'){show('arsenal',0);show('menu',1);S='menu';renderLB();renderArsenal();}if(a=='gate')submitAccessCode();if(a=='reg')submitRegistration();if(a=='edit')showRegistration()});
document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('.b'))SFX.hover()});
const show=(id,v)=>$('#'+id).classList.toggle('hide',!v);
function pauseT(){if(S=='play'){S='pause';show('pause',1);SFX.back()}else if(S=='pause'){S='play';show('pause',0)}}
$('#pb').onclick=pauseT;$('#sk').onclick=()=>{if(S=='intro')endIntro()};
function renderLB(){const c=getCurrentCharacterClass();$('#mi').textContent=playerProfile.name?`${escapeHtml(playerProfile.name)} · ${escapeHtml(playerProfile.uid)} · ${escapeHtml(c.name)}`:'';if($('#menuName'))$('#menuName').textContent=playerProfile.name?escapeHtml(playerProfile.name):'PEMAIN';if($('#menuUid'))$('#menuUid').textContent=playerProfile.uid?escapeHtml(playerProfile.uid):'BELUM TERDAFTAR';if($('#menuAvatar'))$('#menuAvatar').textContent=c.emoji||'☠';$('#lb').innerHTML=playerProfile.name?`Skor terbaik <b style="color:#ffd700">${playerProfile.bestScore}</b> · Rank #${getPlayerRank(playerProfile.bestScore)}`+(playerProfile.skinUnlocked?' · Skin emas':''):''};if($('#arsenalPoints'))$('#arsenalPoints').textContent=`POINT ${playerProfile.points||0}`;updateSkillButtons();if(typeof Tournament!=='undefined'){const b=$('#tournamentBtn');if(b)b.textContent=Tournament.getMenuLabel();const st=$('#tournamentStatus');if(st)st.textContent=Tournament.getStatusText()}
function toMenu(){tutorialActive=false;tutorial=null;show('tutorial',0);setGameplayUI(false);if(S=='pause'&&MODE=='classic'&&P)submitScore(score|0);S='menu';['pause','end','load','gate','reg','rank','prof'].forEach(i=>show(i,0));show('menu',1);$('#pb').style.display='none';$('#bI').style.display='none';$('#tc').style.display='';renderLB()}
function endIntro(){if(S!='intro')return;setGameplayUI(false);S='menu';M=[];slow=1;$('#sk').style.display='none';routePlayer()}
function begin(m){setGameplayUI(false);S='load';show('menu',0);show('end',0);show('arsenal',0);show('tutorial',0);show('load',1);$('#tip').textContent=TIPS[R()*TIPS.length|0];SFX.door();const bar=$('#bar i');bar.style.transition='none';bar.style.width='0';requestAnimationFrame(()=>{bar.style.transition='width 1.6s';bar.style.width='100%'});
 setTimeout(()=>{reset(m);if(m=='classic'){playerProfile.gamesPlayed++;savePlayerProfile()}S='play';show('load',0);setGameplayUI(true);last=performance.now()},1700)}

function openCredits(){show('menu',0);$('#creditsNames').innerHTML=(GAME_CONFIG.ui.credits||[]).map(escapeHtml).map(n=>`<div>${n}</div>`).join('');show('credits',1)}
function closeCredits(){show('credits',0);show('menu',1);S='menu';renderLB()}
const creditsCloseButton=document.querySelector('#credits [data-a="close"]');
if(creditsCloseButton) creditsCloseButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeCredits()});
document.addEventListener('keydown',e=>{if(e.key==='Escape' && !$('#credits').classList.contains('hide')) closeCredits()});

/* ===== V6 INTERACTION / TUTORIAL ===== */
function updateSkillButtons(){
  const b=$('#bS');
  if(!b)return;
  const open=hasSkill(skillSlot);
  b.classList.toggle('locked',!open);
  b.classList.toggle('ready',open && (!P || P.scd<=0));
  const label=b.querySelector('.skill-main');
  if(label)label.textContent=open?`S${skillSlot}`:`🔒 ${skillSlot}`;
  const item=SKILL_SHOP.find(x=>x.slot===skillSlot);
  b.title=open?`${item?.name||'Skill'} · tap untuk ganti skill`:`Skill ${skillSlot} terkunci`;
}
function cycleSkill(){
  const owned=(playerProfile.unlockedSkills||[]).slice().sort((a,b)=>a-b);
  if(!owned.length)return;
  const idx=owned.indexOf(skillSlot);
  skillSlot=owned[(idx+1)%owned.length];
  updateSkillButtons();
  SFX.click();
  say(`Skill aktif: ${skillSlot}`,1.2);
}
function startGameplayTutorial(){
  if(playerProfile.tutorialSeen||tutorialActive||S!='play')return;
  tutorialActive=true;tutorialStep=0;tutorial={mode:touch?'mobile':'desktop',steps:touch?[
    ['🕹','GERAK','Gerakkan analog ke arah mana saja.'],['⚔','SERANG','Tekan HIT untuk menyerang monster.'],['✦','SKILL','Pakai salah satu Skill yang sudah terbuka.'],['↯','MENGHINDAR','Tekan DODGE untuk menghindari serangan.']
  ]:[
    ['W','GERAK','Tekan W / A / S / D atau Arrow untuk bergerak.'],['SPACE','SERANG','Tekan SPACE atau J untuk menyerang.'],['1 / 2 / 3','SKILL','Tekan angka untuk memilih skill. Di HP, tekan tombol skill untuk memakai atau menggantinya.'],['SHIFT','MENGHINDAR','Tekan SHIFT untuk menghindar.']
  ]};renderTutorial();show('tutorial',1);
}
function renderTutorial(){if(!tutorial)return;const s=tutorial.steps[tutorialStep];$('#tutorialIcon').textContent=s[0];$('#tutorialTitle').textContent=s[1];$('#tutorialText').textContent=s[2];$('#tutorialNext').textContent=tutorialStep>=tutorial.steps.length-1?'SELESAI':'LANJUT';}
function tutorialHandleInput(type){
  if(!tutorialActive||!tutorial)return;
  const wanted=['move','hit','skill','dodge'][tutorialStep];
  if(type===wanted){tutorialStep++;if(tutorialStep>=tutorial.steps.length){finishTutorial()}else renderTutorial()}
}
function finishTutorial(){tutorialActive=false;tutorial=null;playerProfile.tutorialSeen=true;savePlayerProfile();show('tutorial',0)}
const tutorialNext=$('#tutorialNext');if(tutorialNext)tutorialNext.addEventListener('click',()=>{if(tutorialStep>=tutorial.steps.length-1)finishTutorial();else{tutorialStep++;renderTutorial()}});

const _originalBegin=begin;
begin=function(m){
  _originalBegin(m);
  window.setTimeout(()=>{
    if(S==='play'){
      updateSkillButtons();
      startGameplayTutorial();
    }
  },1750);
};

document.addEventListener('click',e=>{
  const action=e.target.closest('[data-shop-action]');
  if(action){
    const kind=action.dataset.shopAction;
    const index=Number(action.dataset.index);
    if(kind==='skill')buySkill(index);
    if(kind==='sword')buySword(index);
    renderArsenal();
    updateSkillButtons();
    return;
  }
});
