/* ===== ARSENAL / POINT SHOP ===== */
const SWORDS = Object.freeze([
  {id:'rust',name:'Rustfang',cost:0,damage:1,crit:0,color:'#aaa',desc:'Pedang awal yang stabil.'},
  {id:'moon',name:'Moon Edge',cost:120,damage:1.12,crit:.05,color:'#bdf',desc:'Serangan lebih cepat dan sedikit critical.'},
  {id:'blood',name:'Blood Reaper',cost:300,damage:1.28,crit:.10,color:'#f44',desc:'Damage tinggi dengan efek darah.'},
  {id:'void',name:'Void Fang',cost:650,damage:1.48,crit:.16,color:'#b7f',desc:'Pedang langka dengan critical besar.'}
]);
const SKILL_SHOP = Object.freeze([
  {slot:1,name:'Skill I',cost:0,desc:'Skill karakter utama.'},
  {slot:2,name:'Skill II',cost:180,desc:'Serangan area / mobilitas lanjutan.'},
  {slot:3,name:'Skill III',cost:420,desc:'Ultimate dengan efek besar.'}
]);
function getCurrentSword(){return SWORDS[playerProfile.swordIndex] || SWORDS[0]}
function hasSkill(slot){return playerProfile.unlockedSkills.includes(slot)}
function hasSword(index){return playerProfile.unlockedSwords.includes(index)}
function buySkill(slot){const item=SKILL_SHOP.find(x=>x.slot===slot);if(!item)return;if(hasSkill(slot)){say('Skill sudah terbuka.',1.5);return}if(!spendPoints(item.cost)){say(`POINT kurang · butuh ${item.cost}`,1.8);return}playerProfile.unlockedSkills.push(slot);savePlayerProfile();SFX.lvl();say(`${item.name} terbuka!`,2)}
function buySword(index){const item=SWORDS[index];if(!item)return;if(hasSword(index)){playerProfile.swordIndex=index;savePlayerProfile();say(`${item.name} dipakai.`,1.5);return}if(!spendPoints(item.cost)){say(`POINT kurang · butuh ${item.cost}`,1.8);return}playerProfile.unlockedSwords.push(index);playerProfile.swordIndex=index;savePlayerProfile();SFX.lvl();say(`${item.name} dibeli!`,2)}
function skill(slot=skillSlot){if(!P)return;if(!hasSkill(slot)){say(`Skill ${slot} belum terbuka. Buka di ARSENAL.`,1.8);return}if(P.scd>0){say('SKILL COOLDOWN '+P.scd.toFixed(1)+'s',1.2);return;}const c=getCurrentCharacterClass();const aoe=(r,d)=>{M.forEach(m=>{if(m.st!='death'&&dist(m,P)<r+m.r)hurtM(m,d,1)});NS.forEach(n=>{if(Math.hypot(n.x-P.x,n.y-P.y)<r)hitN(n,d)})};
 const base=(c.skillCooldown ?? 7)*((GAME_CONFIG.gameplay&&GAME_CONFIG.gameplay.skillCooldownMultiplier)||1);P.scd=base*(slot===1?1:slot===2?1.12:1.3);SFX.crit();shake=Math.max(shake,slot===3?14:8);
 if(slot===1){if(c.id=='kn'){P.inv=2;aoe(100,25);ring('#8cf',100)}else if(c.id=='ma'){aoe(170,40);ring('#c6f',170)}else if(c.id=='ar'){for(let i=-2;i<=2;i++){const a=P.face+i*.18;PR.push({f:1,x:P.x,y:P.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,t:.8,d:20})}}else if(c.id=='ro'){let b=null,bd=260;M.forEach(m=>{const d=dist(m,P);if(m.st!='death'&&d<bd){bd=d;b=m}});if(b){const a=Math.atan2(b.y-P.y,b.x-P.x);P.x=cl(b.x-Math.cos(a)*30,15,WW-15);P.y=cl(b.y-Math.sin(a)*30,15,WH-15);hurtM(b,55,1);P.inv=.6}else P.scd=1}else if(c.id=='pr'){P.hp=Math.min(P.mh,P.hp+35);P.sn=Math.min(100,P.sn+30);aoe(120,15);ring('#ff8',120)}else{P.rage=6;ring('#f60',90)}}
 else if(slot===2){aoe(145,34*getCurrentSword().damage);P.inv=.65;P.st=Math.min(100,P.st+20);ring(getCurrentSword().color,145)}
 else {P.inv=1.15;P.rage=5;aoe(210,62*getCurrentSword().damage);for(let i=0;i<10;i++)FX.push({k:'p',x:P.x,y:P.y,vx:R()*280-140,vy:R()*280-140,t:.7,c:getCurrentSword().color,s:4});ring(getCurrentSword().color,210)}
}
function openArsenal(){show('menu',0);renderArsenal();show('arsenal',1)}
function renderArsenal(){const p=$('#arsenalPoints');if(p)p.textContent=`POINT ${playerProfile.points}`;const ss=$('#skillShop');if(ss)ss.innerHTML=SKILL_SHOP.map(x=>`<button class="shop-item ${hasSkill(x.slot)?'owned':''}" data-shop-skill="${x.slot}"><b>${x.name}</b><small>${x.cost?x.cost+' POINT':'TERBUKA'}</small><span>${x.desc}</span></button>`).join('');const sw=$('#swordShop');if(sw)sw.innerHTML=SWORDS.map((x,i)=>`<button class="shop-item ${hasSword(i)?'owned':''} ${playerProfile.swordIndex===i?'equipped':''}" data-shop-sword="${i}"><i style="--blade:${x.color}">⚔</i><b>${x.name}</b><small>${hasSword(i)?(playerProfile.swordIndex===i?'DIPAKAI':'MILIK'):x.cost+' POINT'}</small><span>${x.desc}</span></button>`).join('')}
