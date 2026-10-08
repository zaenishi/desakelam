/*
 * MALAM KELAM — CENTRAL CONFIG
 * Tournament and shop settings live here.
 */
const GAME_CONFIG = Object.freeze({
  app:{name:'Malam Kelam — Desa Bersih',version:'3.0.0',environment:'production',debug:false},
  name:'Malam Kelam — Desa Bersih',
  canvas:{width:960,height:540},
  world:{width:2400,height:1600},
  leaderboard:{maxEntries:300,displayEntries:50,submitOnlyBestScore:true},
  gameplay:{maxMonsters:30,autosaveSeconds:10,pauseWhenHidden:true,skillCooldownMultiplier:1},
  registration:{minNameLength:2,maxNameLength:12,allowedNamePattern:/[^A-Za-z0-9 ]/g,uppercaseName:true},
  cache:{profileTtlMs:30*24*60*60*1000,leaderboardTtlMs:5*60*1000,sessionTtlMs:30*24*60*60*1000},
  ui:{autoFullscreen:false,autoLandscape:false,showCredits:true,credits:['@zaenishi','@kawan-kawan-labkom']},
  tournament:{
    enabled:true,
    enabledToday:true,
    date:null,                 // null = setiap hari. Contoh: '2026-10-10'
    days:null,                 // null = semua hari. Contoh: [6] untuk Sabtu
    startTime:'00:00',
    endTime:'16:30',
    warningMinutes:1,
    countdownSeconds:5,
    topWinners:3,
    revealDelayMs:2200,
    redirectToLeaderboard:true,
    requireAccessCode:true,
    resetNextDay:true
  },
  shop:{
    quizSeconds:30,
    questionReward:10,
    correctReward:25,
    wrongReward:0,
    swordBaseCost:100,
    skillBaseCost:120,
    maxSwordLevel:5,
    maxSkillLevel:5
  }
});
const DATABASE_CONFIG = Object.freeze({
  provider:'indexeddb',name:'malam_kelam_db',version:4,
  stores:{users:'users',leaderboard:'leaderboard',metadata:'metadata'},
  cache:{user:'ml_cache_user',leaderboard:'ml_cache_leaderboard',session:'ml_session',prefix:'ml:v4:'},
  remote:{supabase:{url:'',anonKey:'',usersTable:'users',leaderboardTable:'leaderboard'},firebase:{config:{}}},
  realtime:{enabled:false,pollIntervalMs:5000},
  legacy:{user:'ml_me',leaderboard:'ml_lb2',skin:'ml_skin'}
});
const ACCESS_CODES=Object.freeze(['TURNAMEN26','LEGENDA26','MALAM2026','LAB2024']);
const CHARACTER_CLASSES=Object.freeze([
 {id:'kn',name:'Knight',emoji:'🛡️',color:'#536a8a',hpMultiplier:1.25,speedMultiplier:.95,damageMultiplier:1,skillCooldown:7,skillName:'Shield Bash',weapon:'Pedang Baja',weaponType:'sword',description:'Pertahanan tinggi, pedang berat, hantaman area.'},
 {id:'ma',name:'Mage',emoji:'🔮',color:'#79459a',hpMultiplier:.9,speedMultiplier:1,damageMultiplier:1,skillCooldown:8,skillName:'Arcane Blast',weapon:'Tongkat Arcana',weaponType:'staff',description:'Serangan sihir jarak jauh dan ledakan area.'},
 {id:'ar',name:'Archer',emoji:'🏹',color:'#3d7745',hpMultiplier:1,speedMultiplier:1.1,damageMultiplier:.95,skillCooldown:5,skillName:'Multi Shot',weapon:'Busur Hutan',weaponType:'bow',description:'Cepat dan menyerang dari jarak jauh dengan panah.'},
 {id:'ro',name:'Rogue',emoji:'🗡️',color:'#772f3c',hpMultiplier:.9,speedMultiplier:1.15,damageMultiplier:1.1,skillCooldown:7,skillName:'Shadow Strike',weapon:'Belati Bayangan',weaponType:'dagger',description:'Sangat lincah dengan serangan kritis jarak dekat.'},
 {id:'pr',name:'Priest',emoji:'✨',color:'#aa9638',hpMultiplier:1.1,speedMultiplier:1,damageMultiplier:.9,skillCooldown:10,skillName:'Holy Heal',weapon:'Tongkat Cahaya',weaponType:'staff',description:'Memulihkan HP dan kewarasan sambil menyerang.'},
 {id:'be',name:'Berserker',emoji:'⚔️',color:'#a95520',hpMultiplier:1.15,speedMultiplier:1,damageMultiplier:1.1,skillCooldown:9,skillName:'Rage Mode',weapon:'Kapak Besi',weaponType:'axe',description:'Serangan berat dengan mode amarah yang kuat.'}
]);
const ACHIEVEMENT_RULES=[['kills','Monster',[1,10,50,150,400,1000]],['art','Artefak',[1,5,10,25]],['best','Skor',[500,2000,5000,15000,40000,100000]],['night','Malam',[1,3,5,10]],['wave','Gelombang',[3,10,25]],['combo','Streak',[3,9,15]],['rs','Penyintas',[3,15]],['nt','Catatan',[10,40]],['nest','Sarang',[1,20,60]],['crit','Critical',[10,100]],['dodge','Dodge',[20,200]],['room','Interior',[1,10]],['boss','Boss',[1,5]]];
const ACHIEVEMENTS=[];ACHIEVEMENT_RULES.forEach(([statKey,label,targets])=>targets.forEach(target=>ACHIEVEMENTS.push({id:statKey+target,statKey,target,name:`${label} ${target}` })));
function localDateKey(d=new Date()){const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;}
function tournamentRoundId(d=new Date()){const cfg=GAME_CONFIG.tournament;if(!cfg.enabled||cfg.enabledToday===false)return 'normal';return `tournament:${localDateKey(d)}`;}
