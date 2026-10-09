/* ===== ENTITAS ===== */
const mk=(k,x,y,s=1)=>{const d=T[k];return{k,t:d,x,y,r:d.r,hp:d.hp*s,mh:d.hp*s,st:'idle',stt:0,cd:1,fl:0,face:0,kx:0,ky:0,dash:0,da:0,sc:s,pa:0,spd:1}};
function reset(m){MODE=m;M=[];IT=[];PR=[];FX=[];TX=[];P={sk:0,skT:0,scd:0,rage:0,x:300,y:430,r:13,hp:100*getCurrentCharacterClass().hpMultiplier,mh:100*getCurrentCharacterClass().hpMultiplier,st:100,sn:100,face:0,at:0,cd:0,cmb:0,cmT:0,inv:0,dd:0,dcd:0,lives:3,mv:0,noise:0,meds:1,art:0,kills:0,rs:0,nt:0,walked:0,swings:0,dodges:0,used:0,hf:0,sp:0,dx:1,dy:0,sc20:0,el:0};
 /* Pulihkan dunia luar: run baru TIDAK boleh mewarisi interior rumah / state run sebelumnya (penyebab crash drawWorld) */
 genWorld();OUT=null;ROOM=null;FD=0;I={};
 resetInput();gt=0;wave=0;night=1;INR=0;WW=2400;WH=1600;NS=[];wT=20;tr=0;score=0;weather='clear';wTm=30;boss=0;sc=null;msg=null;
 if(m=='classic')popC();
 else say('Selamat datang di Training. Ikuti instruksi di atas.',6)}
function popC(){M=[];IT=[];NS=[];PR=[];[0,1,2,3,4,5].sort(()=>R()-.5).slice(0,5).forEach(z=>{const p=fp(z,350),g=mk(['bo','gh','sp'][z%3],p.x,p.y,1.6*getNightDifficultyMultiplier());g.guard=1;M.push(g)});
  for(let z=0;z<7;z++)for(let i=0;i<2;i++){const p=fp(z,350);M.push(mk(ZM[z][i],p.x,p.y,getNightDifficultyMultiplier()))}
  for(let i=0;i<8;i++){const p=fp(i%7);IT.push({k:'med',x:p.x,y:p.y})}for(let i=0;i<10;i++){const p=fp(i%6);IT.push({k:'note',x:p.x,y:p.y,i})}for(let i=0;i<3;i++){const p=fp([1,4,5][i]);IT.push({k:'npc',x:p.x,y:p.y})};for(let i=0;i<20;i++){const p=fp(i%7,300);NS.push({x:p.x,y:p.y,hp:40,t:R()*9,cd:R()*8,fl:0})}}
function say(s,d=4){msg={s,t:d}}
