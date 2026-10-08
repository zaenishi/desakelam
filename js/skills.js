/* ===== SKILL KARAKTER ===== */
const ring=(c,r)=>FX.push({k:'ring',x:P.x,y:P.y,r,c,t:.4});
function skill(){if(P.scd>0){say('SKILL COOLDOWN '+P.scd.toFixed(1)+'s',1.2);return;}const c=getCurrentCharacterClass();const skillBoost=1+playerProfile.skillLevel*.12;const aoe=(r,d)=>{d*=skillBoost;M.forEach(m=>{if(m.st!='death'&&dist(m,P)<r+m.r)hurtM(m,d,1)});NS.forEach(n=>{if(Math.hypot(n.x-P.x,n.y-P.y)<r)hitN(n,d)})};
 P.scd=(c.skillCooldown ?? c.cd ?? 0)*((GAME_CONFIG.gameplay&&GAME_CONFIG.gameplay.skillCooldownMultiplier)||1);SFX.crit();shake=Math.max(shake,8);
 if(c.id=='kn'){P.inv=2;aoe(100,25);ring('#8cf',100)}
 else if(c.id=='ma'){aoe(170,40);ring('#c6f',170)}
 else if(c.id=='ar'){let target=null,bd=620;for(const m of M){const d=dist(P,m);if(m.st!=='death'&&d<bd){bd=d;target=m}}const base=target?Math.atan2(target.y-P.y,target.x-P.x):P.face;P.face=base;for(let i=-2;i<=2;i++){const a=base+i*.12;PR.push({f:1,x:P.x+Math.cos(a)*18,y:P.y+Math.sin(a)*18,vx:Math.cos(a)*700,vy:Math.sin(a)*700,t:1.25,d:27*skillBoost,kind:'bow',target:i===0?target:null,homing:i===0&&target?6:0,trail:[]})}shake=Math.max(shake,12);FX.push({k:'ring',x:P.x,y:P.y,r:90,c:'#ffd45a',t:.4})}
 else if(c.id=='ro'){let b=null,bd=260;M.forEach(m=>{const d=dist(m,P);if(m.st!='death'&&d<bd){bd=d;b=m}});if(b){const a=Math.atan2(b.y-P.y,b.x-P.x);P.x=cl(b.x-Math.cos(a)*30,15,WW-15);P.y=cl(b.y-Math.sin(a)*30,15,WH-15);hurtM(b,55*skillBoost,1);P.inv=.6}else P.scd=1}
 else if(c.id=='pr'){P.hp=Math.min(P.mh,P.hp+35);P.sn=Math.min(100,P.sn+30);aoe(120,15);ring('#ff8',120)}
 else{P.rage=6+playerProfile.skillLevel*.35;ring('#f60',90)}}
