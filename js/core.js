/* ===== DASAR ===== */
const $=s=>document.querySelector(s),C=$('#c'),X=C.getContext('2d'),W=GAME_CONFIG.canvas.width,H=GAME_CONFIG.canvas.height,R=Math.random,PI=Math.PI;
let WW=GAME_CONFIG.world.width,WH=GAME_CONFIG.world.height;const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angd=(a,b)=>((a-b+3*PI)%(2*PI))-PI;
const ci=(x,y,r,c)=>{X.fillStyle=c;X.beginPath();X.arc(x,y,r,0,7);X.fill()};
const touch=matchMedia('(pointer:coarse)').matches;if(touch)document.body.classList.add('touch');
let S='intro',MODE='classic',t=0,last=0,shake=0,hitstop=0,slow=1,flash=0,cam={x:0,y:0},it=0,I={},sc=null,msg=null;
let P,M=[],IT=[],PR=[],FX=[],TX=[],OB=[],DC=[],gt=0,wave=0,wT=0,tr=0,score=0,weather='clear',wTm=0,boss=0,fireflies=[],rain=[];
let skillSlot=1, tutorial=null, tutorialStep=0, tutorialActive=false, OUT=null, ROOM=null;
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
