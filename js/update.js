/* ===== UPDATE ===== */
function upPlayer(dt,ctl){let kx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+jx,ky=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0)+jy;if(!ctl)kx=ky=0;
 const l=Math.hypot(kx,ky);if(l>1){kx/=l;ky/=l}const mag=Math.min(1,l);let sprint=(K.ShiftLeft||K.ShiftRight||Math.hypot(jx,jy)>.92)&&mag>.1&&P.st>0&&!K.__d;
 if(ctl&&(K.ShiftLeft||K.ShiftRight)&&db>0)sprint=false;
 P.cd-=dt;P.rage-=dt;P.skT-=dt;P.scd-=dt;if(P.skT<=0)P.sk=0;P.at-=dt;P.inv-=dt;P.noise-=dt;P.dcd-=dt;P.hf-=dt;P.cmT-=dt;if(P.cmT<=0)P.cmb=0;ab-=dt;db-=dt;eb-=dt;
 if(ctl&&ab>0){atk();ab=0}if(ctl&&sb>0){skill();sb=0}if(ctl&&fb>0){useDoor();fb=0}sb-=dt;fb-=dt;
 if(ctl&&db>0&&P.dcd<=0&&P.st>=20){P.dd=.18;P.dcd=.6;P.inv=.3;P.st-=20;P.dodges++;updatePlayerStat('dodge',1);if(l>.1){P.dx=kx/l*(l>1?1:l)||kx;P.dy=ky}SFX.swing();db=0;for(let i=0;i<6;i++)FX.push({k:'p',x:P.x,y:P.y,vx:R()*60-30,vy:R()*60-30,t:.4,c:'#777',s:4})}
 if(ctl&&eb>0&&P.meds>0&&P.hp<P.mh){P.meds--;P.hp=Math.min(P.mh,P.hp+30);P.used++;SFX.pick();TX.push({s:'+30',x:P.x,y:P.y-30,t:1,c:'#4f4',z:16});eb=0}
 if(P.dd>0){P.dd-=dt;const n=Math.hypot(P.dx,P.dy)||1;mvE(P,P.dx/n*420*dt,P.dy/n*420*dt)}
 else{const v=(sprint?200:130)*getCurrentCharacterClass().speedMultiplier*(P.rage>0?1.2:1)*mag;mvE(P,kx*(v/Math.max(mag,.01))*dt*(mag>0?1:0),ky*(v/Math.max(mag,.01))*dt*(mag>0?1:0));
  if(mag>.1){P.dx=kx;P.dy=ky;if(P.at<=0)P.face=Math.atan2(ky,kx);P.walked+=v*dt;if(sprint){P.st-=15*dt;P.noise=.3}P.sp-=dt;if(P.sp<=0){P.sp=sprint?.25:.4;SFX.step(zoneAt(P.x,P.y))}}}
 P.mv=mag>.1;if(!sprint&&P.at<=0)P.st=Math.min(100,P.st+(P.mv?14:24)*dt);P.st=Math.max(0,P.st);
 if(MODE=='train')P.st=100}
function upGame(dt){const ctl=S=='play'||I.ctl;I.cdc=(I.cdc||0)-dt;if(S=='play'){I.ac=(I.ac||0)-dt;if(I.ac<=0){I.ac=1.5;checkAchievements()}I.sv=(I.sv||0)-dt;if(I.sv<=0){I.sv=10;if(MODE=='classic'&&S=='play')submitScore(score|0);else savePlayerProfile()}}upPlayer(dt,ctl);
 const hr=((18*60+gt)/60)%24,ds=dk(hr);
 if(MODE=='classic'&&S=='play'){gt+=dt*2;score+=dt*3;if(gt>=720)newNight(500*night,'Fajar... malam berikutnya lebih kelam.');
  if(!INR)wT-=dt;if(wT<=0&&!INR){wave++;updatePlayerStat('wave',wave,1);wT=40;const n=Math.min(12,2+wave);for(let i=0;i<n;i++){const a=R()*7,x=cl(P.x+Math.cos(a)*520,40,WW-40),y=cl(P.y+Math.sin(a)*520,40,WH-40);if(hitO(x,y,24))continue;const m=mk(['sh','sp','bo','gh'][R()*4|0],x,y,1+wave*.1+(night-1)*.25);go(m,'chase');M.push(m)}
   say('Gelombang '+wave+' mendekat!',3);if(wave>1&&R()<.5){const m=mk('sh',P.x-Math.cos(P.face)*90,P.y-Math.sin(P.face)*90,1);if(!hitO(m.x,m.y,14)){go(m,'chase');M.push(m);scare()}}}
  wTm-=dt;if(wTm<=0){wTm=35+R()*25;weather=['clear','rain','fog','storm','rain','eclipse'][R()*6|0];if(weather=='storm')I.lt=3;if(weather=='eclipse'){const p=fp(R()*7|0,400),g=mk('wo',p.x,p.y,.5);g.guard=1;go(g,'patrol');M.push(g);say('GERHANA! Poin x2, monster elit muncul!',4)}}
  if(P.rs+P.nt>=0&&!INR&&zoneAt(P.x,P.y)==6&&P.art>=5&&!boss){boss=1;const m=mk('wo',2000,1100,1);m.boss=1;go(m,'chase');M.push(m);scare();SFX.howl();say('BOSS: Raja Sampah Kimia!',4)}
  const dark=ds>.6||zoneAt(P.x,P.y)==5||weather=='fog',near=M.some(m=>m.st=='chase'&&dist(m,P)<250);
  P.sn=cl(P.sn+(dark?-1.2:.5)*dt*(near?3:1),0,100);if(P.sn<25&&R()<dt*.04)scare();
  if(P.sn<=0)P.hp-=2*dt,P.hf=.1;if(P.hp<=0&&S=='play')dmgP(0)}
 if(MODE=='train'&&S=='play')trainStep();
 if(weather=='storm'){I.lt=(I.lt??4)-dt;if(I.lt<=0){I.lt=6+R()*6;flash=1;SFX.thunder();shake=Math.max(shake,5)}}
 NS.forEach(n=>{n.fl-=dt;n.cd-=dt;if(n.cd<=0&&Math.hypot(n.x-P.x,n.y-P.y)<450&&M.length<30){n.cd=10+R()*6;const m=mk(['sh','sp'][R()*2|0],n.x+28,n.y,1+(night-1)*.25);go(m,'chase');M.push(m)}});NS=NS.filter(n=>!n.dead);
 for(const m of M)upM(m,dt);M=M.filter(m=>!m.dead);
 for(let i=0;i<M.length;i++)for(let j=i+1;j<M.length;j++){const a=M[i],b=M[j],d=dist(a,b),q=a.r+b.r;if(d<q&&d>0){const p=(q-d)/2,nx=(a.x-b.x)/d,ny=(a.y-b.y)/d;mvE(a,nx*p,ny*p,a.t.fly);mvE(b,-nx*p,-ny*p,b.t.fly)}}
 PR.forEach(p=>updateProjectile(p,dt));PR=PR.filter(p=>p.t>0);
 for(const it of IT){const d=dist(P,it);if(it.k=='cd'){if(d<28&&!it.lit&&I.cdc<=0)cdTouch(it);continue}if(it.k=='chest'&&!ROOM.open)continue;if(d<(it.k=='npc'?44:it.k=='chest'?36:28)&&!it.got){it.got=1;SFX.pick();
  if(it.k=='med'){P.meds++;say('Medkit +1 (tekan E / MED)',2)}if(it.k=='chest'){addScore(300*night);P.meds++;P.sn=Math.min(100,P.sn+20);say('Peti terbuka! +'+300*night,3)}
  if(it.k=='art'){P.art++;updatePlayerStat('art',1);addScore(150*night);say(`Artefak ${P.art}/5 terkumpul`,3);SFX.lvl();if(P.art>=5)say('Semua artefak terkumpul! Menuju Menara Terkutuk!',5)}
  if(it.k=='note'){P.nt++;updatePlayerStat('nt',1);addScore(20);P.sn=Math.min(100,P.sn+10);say(LORE[it.i],5)}
  if(it.k=='npc'){P.rs++;updatePlayerStat('rs',1);addScore(100);P.hp=Math.min(P.mh,P.hp+25);P.sn=Math.min(100,P.sn+25);say(`Penyintas ${P.rs}/3 diselamatkan. Mereka membekalimu.`,4)}}}
 IT=IT.filter(i=>!i.got);
 FX.forEach(f=>{f.t-=dt;if(f.k=='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.94;f.vy*=.94}});FX=FX.filter(f=>f.t>0);TX.forEach(x=>{x.t-=dt;x.y-=25*dt});TX=TX.filter(x=>x.t>0);
 if(msg&&(msg.t-=dt)<=0)msg=null;
 if(sc&&(sc.t-=dt)<=0)sc=null;
 /* musik dinamis + detak jantung */
 mus(dt);I.hb=(I.hb||0)-dt;if(AC&&dg){const c=M.some(m=>m.st=='chase');dg.gain.value=c?.09:.045;if(P.hp<P.mh*.4&&I.hb<=0){SFX.heart();I.hb=.4+P.hp/P.mh*1.2}if(c&&(I.dr=(I.dr||0)-dt)<=0){I.dr=.5;tone(55,.2,'sine',.25)}
  if((I.am=(I.am||0)-dt)<=0){I.am=6+R()*8;[SFX.howl,SFX.cricket][R()*2|0]()}}
 if(P.hp<P.mh)P.hp=Math.min(P.mh,P.hp+0)}
function dk(h){return h>=18&&h<20?.3+(h-18)*.25:h>=20||h<4?.85:h>=4&&h<6?.85-(h-4)*.2:.4}
/* Titik terdekat yang bisa dijangkau (bukan di dalam bangunan / luar peta) -> Training tidak bisa macet. */
function freeSpot(x,y,r){
 const ok=(a,b)=>a>24&&a<WW-24&&b>24&&b<WH-24&&!hitO(a,b,r);
 if(ok(x,y))return{x,y};
 for(let d=30;d<=480;d+=30)for(let k=0;k<16;k++){const a=k*PI/8,nx=x+Math.cos(a)*d,ny=y+Math.sin(a)*d;if(ok(nx,ny))return{x:nx,y:ny}}
 return{x:P.x,y:P.y}}
function trainStep(){const s=tr;
 if(s==0&&P.walked>200)nx();else if(s==1&&P.swings>=3)nx();
 else if(s==2){if(!I.d){const q=freeSpot(P.x+260,P.y,16),m=mk('sh',q.x,q.y,.5);m.sp0=1;go(m,'chase');M.push(m);I.d=m;I.k0=P.kills}if(P.kills>I.k0){nx()}}
 else if(s==3&&P.dodges>=1)nx();
 else if(s==4){if(!I.m){const q=freeSpot(P.x+200,P.y-100,14);I.m={k:'med',x:q.x,y:q.y};IT.push(I.m);P.hp=60}if(P.used>=1)nx()}
 else if(s==5){if(!I.a){const q=freeSpot(P.x+250,P.y+60,16);I.a={k:'art',x:q.x,y:q.y};IT.push(I.a)}if(P.art>=1){sv('ml_skin',1);playerProfile.skinUnlocked=1;savePlayerProfile();win()}}}
function nx(){tr++;I={ctl:I.ctl};SFX.lvl();say('Langkah selesai!',1.2)}
