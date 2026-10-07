/* ===== PROGRESSION MENUS: SHOP / CHARACTER / SKILLS / WEAPONS ===== */
const WEAPON_ITEMS = Object.freeze([
  {id:'rustblade',name:'Rust Blade',price:0,damage:1,attackSpeed:1,description:'Senjata awal yang dapat diandalkan.'},
  {id:'bloodedge',name:'Blood Edge',price:800,damage:1.25,attackSpeed:.95,description:'Damage lebih tinggi, serangan sedikit lebih berat.'},
  {id:'nightfang',name:'Night Fang',price:1400,damage:1.15,attackSpeed:1.2,description:'Cepat dan cocok untuk menghadapi gerombolan.'}
]);
const SKILL_ITEMS = Object.freeze([
  {id:'class',name:'Skill Karakter',price:0,description:'Skill bawaan karakter aktif.'},
  {id:'shadowstep',name:'Shadow Step',price:900,description:'Skill utility tambahan untuk mobilitas.'},
  {id:'ward',name:'Blood Ward',price:1200,description:'Skill utility defensif dengan cooldown panjang.'}
]);
function ensureInventory(){
  playerProfile.ownedWeapons=Array.isArray(playerProfile.ownedWeapons)?playerProfile.ownedWeapons:['rustblade'];
  playerProfile.ownedSkills=Array.isArray(playerProfile.ownedSkills)?playerProfile.ownedSkills:['class'];
  if(!playerProfile.ownedWeapons.includes('rustblade'))playerProfile.ownedWeapons.unshift('rustblade');
  if(!WEAPON_ITEMS.some(x=>x.id===playerProfile.equippedWeapon))playerProfile.equippedWeapon='rustblade';
  if(!playerProfile.ownedSkills.includes('class'))playerProfile.ownedSkills.unshift('class');
  if(!SKILL_ITEMS.some(x=>x.id===playerProfile.equippedSkill))playerProfile.equippedSkill='class';
}
function getWeapon(){ensureInventory();return WEAPON_ITEMS.find(x=>x.id===playerProfile.equippedWeapon)||WEAPON_ITEMS[0]}
function spendPoints(price){if((playerProfile.points|0)<price){say('Points tidak cukup.',2);SFX.hurt();return false}playerProfile.points-=price;savePlayerProfile();return true}
function buyWeapon(id){ensureInventory();const x=WEAPON_ITEMS.find(i=>i.id===id);if(!x)return;if(playerProfile.ownedWeapons.includes(id)){playerProfile.equippedWeapon=id;savePlayerProfile();say(x.name+' dipakai.',2);renderWeaponPanel();renderShopPanel();return}if(!spendPoints(x.price))return;playerProfile.ownedWeapons.push(id);playerProfile.equippedWeapon=id;savePlayerProfile();SFX.lvl();say(x.name+' berhasil dibeli.',2);renderWeaponPanel();renderShopPanel();renderLB()}
function equipWeapon(id){ensureInventory();if(!playerProfile.ownedWeapons.includes(id))return;playerProfile.equippedWeapon=id;savePlayerProfile();say('Weapon dipakai.',1.5);renderWeaponPanel();renderShopPanel()}
function buySkill(id){ensureInventory();const x=SKILL_ITEMS.find(i=>i.id===id);if(!x)return;if(playerProfile.ownedSkills.includes(id)){playerProfile.equippedSkill=id;savePlayerProfile();say(x.name+' dipilih.',2);renderShopPanel();renderSkillPanel();return}if(!spendPoints(x.price))return;playerProfile.ownedSkills.push(id);playerProfile.equippedSkill=id;savePlayerProfile();SFX.lvl();say(x.name+' berhasil dibeli.',2);renderShopPanel();renderSkillPanel();renderLB()}
function equipSkill(id){ensureInventory();if(!playerProfile.ownedSkills.includes(id))return;playerProfile.equippedSkill=id;savePlayerProfile();renderShopPanel();renderSkillPanel()}
function openProgressPanel(id){
  show('menu',0);
  ['shop','character'].forEach(x=>show(x,0));
  if(id==='shop'){renderShopPanel();renderSkillPanel();show('shop',1)}
  if(id==='character'){renderCharacterPanel();show('character',1)}
}
function renderShopPanel(){
  ensureInventory();
  $('#shopPoints').textContent=`${playerProfile.points|0} POINTS`;
  $('#shopList').innerHTML=WEAPON_ITEMS.slice(1).map(x=>{
    const own=playerProfile.ownedWeapons.includes(x.id),eq=playerProfile.equippedWeapon===x.id;
    return `<article class="item-card"><div class="item-icon">⚔</div><b>${x.name}</b><small>${escapeHtml(x.description)}</small><small>Damage ×${x.damage} · Speed ×${x.attackSpeed}</small><button class="b s" data-inv="weapon" data-id="${x.id}">${eq?'TERPAKAI':own?'PAKAI':'BELI · '+x.price}</button></article>`;
  }).join('');
}
function renderSkillPanel(){
  ensureInventory();
  $('#skillList').innerHTML=SKILL_ITEMS.map(x=>{
    const own=playerProfile.ownedSkills.includes(x.id),eq=playerProfile.equippedSkill===x.id;
    return `<article class="item-card"><div class="item-icon">✦</div><b>${x.name}</b><small>${escapeHtml(x.description)}</small><button class="b s" data-inv="skill" data-id="${x.id}">${eq?'AKTIF':own?'GUNAKAN':x.price?'BELI · '+x.price:'BAWAAN'}</button></article>`;
  }).join('');
}
function renderCharacterPanel(){
  const active=playerProfile.characterIndex;
  $('#characterList').innerHTML=CHARACTER_CLASSES.map((c,i)=>`<article class="item-card ${active===i?'active':''}"><div class="item-icon">${c.emoji}</div><b>${c.name}</b><small>${escapeHtml(c.description)}</small><small>HP ×${c.hpMultiplier} · Speed ×${c.speedMultiplier} · Damage ×${c.damageMultiplier}</small>${active===i?'<span class="character-status">KARAKTER SAAT INI</span>':''}</article>`).join('');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-inv]');if(!b)return;const id=b.dataset.id;if(b.dataset.inv==='weapon'){const own=playerProfile.ownedWeapons.includes(id);own?equipWeapon(id):buyWeapon(id)}else if(b.dataset.inv==='skill'){const own=playerProfile.ownedSkills.includes(id);own?equipSkill(id):buySkill(id)}else if(b.dataset.inv==='character')say('Karakter sudah dikunci setelah registrasi.',2)});
