/* ===== INPUT ===== */
const K={};let ab=0,db=0,eb=0,sb=0,fb=0,jx=0,jy=0,jid=null,jo;
const skillPress=[0,0,0,0];
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;K[e.code]=1;if(e.code=='Digit1'||e.code=='Digit2'||e.code=='Digit3'){
  const n=Number(e.code.slice(-1));
  skillSlot=n;
  updateSkillButtons();
  skillPress[n]=.12;
  advanceTutorialByInput('skill');
}if(e.code=='KeyK'||e.code=='KeyQ'){skillPress[skillSlot]=.12;advanceTutorialByInput('skill');}if(e.code=='KeyF')fb=.12;if(e.code=='Space'||e.code=='KeyJ'){ab=.12;advanceTutorialByInput('hit');e.preventDefault()}if(e.code.startsWith('KeyW')||e.code.startsWith('KeyA')||e.code.startsWith('KeyS')||e.code.startsWith('KeyD')||e.code.startsWith('Arrow'))advanceTutorialByInput('move');if(e.code.startsWith('Shift')){db=.12;advanceTutorialByInput('dodge')}if(e.code.startsWith('Shift'))db=.12;if(e.code=='KeyE')eb=.12;if(e.code=='Escape')pauseT();au()});
addEventListener('keyup',e=>K[e.code]=0);
const jz=$('#jz'),jb=$('#jb'),jk=$('#jk');
function advanceTutorialByInput(type){if(typeof tutorialHandleInput==='function')tutorialHandleInput(type)}
jz.addEventListener('pointerdown',e=>{jid=e.pointerId;jo={x:e.clientX,y:e.clientY};try{jz.setPointerCapture(jid)}catch(_){}jb.style.cssText=`display:block;left:${jo.x-50}px;top:${jo.y-50}px`;jk.style.cssText=`display:block;left:${jo.x-22}px;top:${jo.y-22}px`});
jz.addEventListener('pointermove',e=>{if(e.pointerId!=jid)return;advanceTutorialByInput('move');const dx=e.clientX-jo.x,dy=e.clientY-jo.y,l=Math.hypot(dx,dy)||1,m=Math.min(l,50);jx=dx/l*m/50;jy=dy/l*m/50;jk.style.left=jo.x-22+jx*50+'px';jk.style.top=jo.y-22+jy*50+'px'});
const je=e=>{if(e.pointerId==jid){jid=null;jx=jy=0;jb.style.display=jk.style.display='none'}};jz.addEventListener('pointerup',je);jz.addEventListener('pointercancel',je);
const skillButton=$('#bS');
let skillTapAt=0,skillTapTimer=0;
if(skillButton)skillButton.addEventListener('pointerdown',e=>{
  e.preventDefault();au();
  const now=performance.now();
  if(now-skillTapAt<320){
    clearTimeout(skillTapTimer);
    skillTapAt=0;
    cycleSkill();
    return;
  }
  skillTapAt=now;
  skillTapTimer=setTimeout(()=>{
    skillPress[skillSlot]=.12;
    advanceTutorialByInput('skill');
    advanceTutorialByInput('action');
  },180);
});
[['#bI',()=>fb=.12],['#bH',()=>{ab=.12;advanceTutorialByInput('hit')}],['#bD',()=>{db=.12;advanceTutorialByInput('dodge')}],['#bE',()=>eb=.12]].forEach(([s,f])=>$(s).addEventListener('pointerdown',e=>{e.preventDefault();f();au();advanceTutorialByInput('action')}));
