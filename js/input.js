/* ===== INPUT ===== */
const K={};let ab=0,db=0,eb=0,sb=0,fb=0,jx=0,jy=0,jid=null,jo;
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;K[e.code]=1;if(e.code=='KeyK'||e.code=='KeyQ')sb=.12;if(e.code=='KeyF')fb=.12;if(e.code=='Space'||e.code=='KeyJ'){ab=.12;e.preventDefault()}if(e.code.startsWith('Shift'))db=.12;if(e.code=='KeyE')eb=.12;if(e.code=='Escape')pauseT();au()});
addEventListener('keyup',e=>K[e.code]=0);
const jz=$('#jz'),jb=$('#jb'),jk=$('#jk');
function resetJoystickVisual(){jb.style.left='5vw';jb.style.right='auto';jb.style.top='auto';jb.style.bottom='5vh';jk.style.left='calc(5vw + 28px)';jk.style.right='auto';jk.style.top='auto';jk.style.bottom='calc(5vh + 28px)'}
resetJoystickVisual();
jz.addEventListener('pointerdown',e=>{if(S!=='play')return;jid=e.pointerId;jo={x:e.clientX,y:e.clientY};try{jz.setPointerCapture(jid)}catch(_){}jb.style.left=(jo.x-50)+'px';jb.style.top=(jo.y-50)+'px';jb.style.bottom='auto';jk.style.left=(jo.x-22)+'px';jk.style.top=(jo.y-22)+'px';jk.style.bottom='auto'});
jz.addEventListener('pointermove',e=>{if(e.pointerId!=jid)return;const dx=e.clientX-jo.x,dy=e.clientY-jo.y,l=Math.hypot(dx,dy)||1,m=Math.min(l,50);jx=dx/l*m/50;jy=dy/l*m/50;jk.style.left=jo.x-22+jx*50+'px';jk.style.top=jo.y-22+jy*50+'px'});
const je=e=>{if(e.pointerId==jid){jid=null;jx=jy=0;resetJoystickVisual()}};jz.addEventListener('pointerup',je);jz.addEventListener('pointercancel',je);
[['#bS',()=>sb=.12],['#bI',()=>fb=.12],['#bH',()=>ab=.12],['#bD',()=>db=.12],['#bE',()=>eb=.12]].forEach(([s,f])=>$(s).addEventListener('pointerdown',e=>{e.preventDefault();f();au()}));
