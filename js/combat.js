/* ===== COMBAT ===== */
function atk(){if(P.cd>0||P.st<8||P.dd>0)return;P.cd=.33;P.at=.22;P.st-=8;P.noise=.6;P.swings++;SFX.swing();
 let b=null,bd=170;for(const m of M)if(m.st!='death'){const d=dist(P,m);if(d<bd){bd=d;b=m}}
 if(b)P.face=Math.atan2(b.y-P.y,b.x-P.x);
 P.cmT=1.2;P.cmb++;const crit=P.cmb>=3;if(crit)P.cmb=0;let hit=0;
 for(const m of M){if(m.st=='death')continue;const d=dist(P,m);if(d<85+m.r&&(d<m.r+22||Math.abs(angd(Math.atan2(m.y-P.y,m.x-P.x),P.face))<PI/2)){hurtM(m,12*getCurrentCharacterClass().damageMultiplier*getWeapon().damage*(P.rage>0?2:1)*(crit?2:1),crit);hit=1}}
 FX.push({k:'slash',x:P.x,y:P.y,a:P.face,t:.22,c:crit});NS.forEach(n=>{if(Math.hypot(n.x-P.x,n.y-P.y)<95){hitN(n,12*getCurrentCharacterClass().damageMultiplier*(P.rage>0?2:1)*(crit?2:1));hit=1}});if(crit)updatePlayerStat('crit',1);
 if(crit){FX.push({k:'bolt',x:P.x+Math.cos(P.face)*90,y:P.y+Math.sin(P.face)*90,t:.25});TX.push({s:'CRITICAL!',x:P.x,y:P.y-50,t:1,c:'#f33',z:20})}
 if(hit){hitstop=crit?.1:.05;shake=Math.max(shake,crit?10:5)}}
function hurtM(m,d,crit){if(m.t.fly&&0)return;if(m.k=='sh')d*=1.5;m.hp-=d;m.fl=.1;const a=Math.atan2(m.y-P.y,m.x-P.x),kb=m.k=='wo'||m.k=='bo'?120:260;m.kx=Math.cos(a)*kb;m.ky=Math.sin(a)*kb;
 TX.push({s:Math.round(d),x:m.x,y:m.y-m.r-10,t:.9,c:crit?'#f22':'#fff',z:crit?22:13});blood(m.x,m.y,crit?14:7);(crit?SFX.crit:SFX.hit)();FX.push({k:'spark',x:m.x,y:m.y,t:.15});
 if(m.hp<=0){m.st='death';m.stt=0;SFX.die();P.kills++;addScore(m.guard?80+m.mh|0:8+(m.mh/3|0));P.sk++;P.skT=5;updatePlayerStat('kills',1);updatePlayerStat('combo',P.sk,1);if(m.boss)updatePlayerStat('boss',1);if(m.guard){IT.push({k:'art',x:m.x,y:m.y});say('Artefak jatuh dari penjaga!',3)}else if(R()<.15)IT.push({k:'med',x:m.x,y:m.y});
  if(m.k=='wo'&&m.boss)newNight(1500*night,'Gerbang terbuka!');if(m.guard||m.boss||!M.some(q=>q!=m&&q.st!='death'&&q.st=='chase')){slow=.3;shake=Math.max(shake,8)}}
 else if(m.k!='wo'||m.hp<m.mh*.5){m.st='hurt';m.stt=0}}
function blood(x,y,n){for(let i=0;i<n;i++){const a=R()*7,v=40+R()*160;FX.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:.5+R()*.4,c:R()<.7?'#a00':'#500',s:2+R()*3})}}
function dmgP(d){if(P.inv>0||S=='intro'||P.dd>0)return;if(P.ward>0)d*=.45;P.hp-=d;P.inv=.5;P.hf=.6;shake=Math.max(shake,9);SFX.hurt();try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}blood(P.x,P.y,8);
 if(MODE=='train')P.hp=Math.max(P.hp,1);
 if(P.hp<P.mh*.2&&!P.sc20&&P.hp>0){P.sc20=1;scare()}
 if(P.hp<=0){P.lives--;if(P.lives>0){P.hp=P.mh;P.inv=2.5;P.sn=Math.max(P.sn,50);P.x=300;P.y=430;P.sc20=0;say('Kau bangkit... nyawa tersisa '+P.lives,3);M.forEach(m=>{if(dist(m,P)<300)m.st='patrol'})}else lose('Kau gugur di desa terkutuk.')}}
function scare(){sc={t:.55};SFX.scare();shake=16}
