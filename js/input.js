/* ===== INPUT ===== */
const K={};let ab=0,db=0,eb=0,sb=0,fb=0,jx=0,jy=0,jid=null,jo;
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'&&!(typeof UI!=='undefined'&&UI.is(GAMEPLAY_STATE)))return;K[e.code]=1;if(e.code=='KeyK'||e.code=='KeyQ')sb=.12;if(e.code=='KeyF')fb=.12;if(e.code=='Space'||e.code=='KeyJ'){ab=.12;e.preventDefault()}if(e.code.startsWith('Shift'))db=.12;if(e.code=='KeyE')eb=.12;if(e.code=='Escape')pauseT();au()});
addEventListener('keyup',e=>K[e.code]=0);
const jz=$('#jz'),jb=$('#jb'),jk=$('#jk');let JR=52;
/* Joystick: cincin selalu tampak (penanda "analog"); begitu disentuh, pusatnya pindah ke jari. */
function jPlace(cx,cy,dx,dy){const kr=JR*.45;jb.style.left=cx-JR+'px';jb.style.top=cy-JR+'px';jk.style.left=cx+dx*JR-kr+'px';jk.style.top=cy+dy*JR-kr+'px'}
function jIdle(){JR=Math.round(Math.max(40,Math.min(70,innerHeight*.16)));jb.style.width=jb.style.height=JR*2+'px';jk.style.width=jk.style.height=Math.round(JR*.9)+'px';
 jb.classList.add('idle');jb.style.display=jk.style.display='block';jPlace(Math.max(JR+18,innerWidth*.1),innerHeight-Math.max(JR+18,innerHeight*.27),0,0)}
jz.addEventListener('pointerdown',e=>{if(jid!==null)return;jid=e.pointerId;jo={x:e.clientX,y:e.clientY};try{jz.setPointerCapture(jid)}catch(_){}jb.classList.remove('idle');jPlace(jo.x,jo.y,0,0);au()});
jz.addEventListener('pointermove',e=>{if(e.pointerId!=jid)return;const dx=e.clientX-jo.x,dy=e.clientY-jo.y,l=Math.hypot(dx,dy)||1,m=Math.min(l,JR);jx=dx/l*m/JR;jy=dy/l*m/JR;jPlace(jo.x,jo.y,jx,jy)});
const je=e=>{if(e.pointerId==jid){jid=null;jx=jy=0;jIdle()}};jz.addEventListener('pointerup',je);jz.addEventListener('pointercancel',je);jz.addEventListener('lostpointercapture',je);
addEventListener('resize',()=>{if(jid===null)jIdle()});jIdle();
/* Hindari tombol/arah 'nyangkut' saat jendela kehilangan fokus atau tab disembunyikan */
addEventListener('blur',()=>resetInput());document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput()});
[['#bS',()=>sb=.12],['#bI',()=>fb=.12],['#bH',()=>ab=.12],['#bD',()=>db=.12],['#bE',()=>eb=.12]].forEach(([s,f])=>$(s).addEventListener('pointerdown',e=>{e.preventDefault();f();au()}));

/* Dipanggil tiap pindah state agar tidak ada input 'nyangkut' (joystick/tombol). */
function resetInput(){ab=db=eb=sb=fb=0;jx=jy=0;jid=null;for(const k in K)K[k]=0;if(typeof jIdle=='function')jIdle()}
