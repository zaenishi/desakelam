/* ===== DASAR (core) ===== */
const $=s=>document.querySelector(s),C=$('#c'),X=C.getContext('2d'),W=GAME_CONFIG.canvas.width,H=GAME_CONFIG.canvas.height,R=Math.random,PI=Math.PI;
let WW=GAME_CONFIG.world.width,WH=GAME_CONFIG.world.height;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angd=(a,b)=>((a-b+3*PI)%(2*PI))-PI;
const ci=(x,y,r,c)=>{X.fillStyle=c;X.beginPath();X.arc(x,y,r,0,7);X.fill()};
/* Deteksi layar sentuh: dicek saat load DAN saat sentuhan pertama (mis. DevTools/hybrid laptop). */
let touch=matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints||0)>0||'ontouchstart' in window;
const enableTouchUI=()=>{touch=true;document.body.classList.add('touch')};
if(touch)enableTouchUI();
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen')enableTouchUI()},{capture:true,passive:true});
addEventListener('touchstart',enableTouchUI,{capture:true,passive:true,once:true});
/* State global gameplay. S = fase game loop ('intro','menu','load','play','pause','end','tend','cine').
   S tidak diubah langsung: gunakan UI.set(...) di state.js agar HUD/overlay ikut konsisten. */
let S='intro',MODE='classic',t=0,last=0,shake=0,hitstop=0,slow=1,flash=0,cam={x:0,y:0},it=0,I={},sc=null,msg=null;
let P,M=[],IT=[],PR=[],FX=[],TX=[],OB=[],DC=[],gt=0,wave=0,wT=0,tr=0,score=0,weather='clear',wTm=0,boss=0,fireflies=[],rain=[];
/* Variabel yang dulu tidak dideklarasikan (penyebab ReferenceError di versi lama) */
let FD=0,fsDone=false,INR=0,OUT=null,ROOM=null,NS=[];
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};

/* Event bus kecil: sinkronisasi koin/profil antar layar tanpa saling bergantung. */
const Events=(()=>{const map=new Map();return{
  on(n,f){if(!map.has(n))map.set(n,new Set());map.get(n).add(f);return()=>map.get(n)&&map.get(n).delete(f)},
  emit(n,...a){const s=map.get(n);if(s)[...s].forEach(f=>{try{f(...a)}catch(e){console.error(e)}})}
}})();
