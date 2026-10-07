/* ===== SKILL KARAKTER ===== */
const ring=(c,r)=>FX.push({k:'ring',x:P.x,y:P.y,r,c,t:.4});
function skill(){if(P.scd>0){say('SKILL COOLDOWN '+P.scd.toFixed(1)+'s',1.2);return;}const c=getCurrentCharacterClass();const aoe=(r,d)=>{M.forEach(m=>{if(m.st!='death'&&dist(m,P)<r+m.r)hurtM(m,d,1)});NS.forEach(n=>{if(Math.hypot(n.x-P.x,n.y-P.y)<r)hitN(n,d)})};
 const selected=playerProfile.equippedSkill||'class';
 if(selected==='shadowstep'){P.scd=9;const d=Math.min(180,Math.max(70,dist(P,{x:P.x+P.dx*180,y:P.y+P.dy*180})));P.inv=.9;P.x=cl(P.x+P.dx*d,20,WW-20);P.y=cl(P.y+P.dy*d,20,WH-20);ring('#8cf',70);SFX.crit();say('SHADOW STEP',1.2);return}
 if(selected==='ward'){P.scd=12;P.ward=5;P.inv=.35;P.sn=Math.min(100,P.sn+15);ring('#a5f',90);SFX.crit();say('BLOOD WARD · damage berkurang',1.8);return}
 P.scd=(c.skillCooldown ?? c.cd ?? 0)*((GAME_CONFIG.gameplay&&GAME_CONFIG.gameplay.skillCooldownMultiplier)||1);SFX.crit();shake=Math.max(shake,8);
 if(c.id=='kn'){P.inv=2;aoe(100,25);ring('#8cf',100)}
 else if(c.id=='ma'){aoe(170,40);ring('#c6f',170)}
 else if(c.id=='ar'){for(let i=-2;i<=2;i++){const a=P.face+i*.18;PR.push({f:1,x:P.x,y:P.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,t:.8,d:20})}}
 else if(c.id=='ro'){let b=null,bd=260;M.forEach(m=>{const d=dist(m,P);if(m.st!='death'&&d<bd){bd=d;b=m}});if(b){const a=Math.atan2(b.y-P.y,b.x-P.x);P.x=cl(b.x-Math.cos(a)*30,15,WW-15);P.y=cl(b.y-Math.sin(a)*30,15,WH-15);hurtM(b,55,1);P.inv=.6}else P.scd=1}
 else if(c.id=='pr'){P.hp=Math.min(P.mh,P.hp+35);P.sn=Math.min(100,P.sn+30);aoe(120,15);ring('#ff8',120)}
 else{P.rage=6;ring('#f60',90)}}
