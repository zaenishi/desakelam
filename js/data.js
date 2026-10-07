/* ===== DATA ===== */
const ZN=[['Rumah Tua',0,0,600,800,'#1d1511','#3a2616'],['Peternakan',600,0,600,800,'#202612','#4a3818'],['Hutan Mati',1200,0,600,800,'#0e1a12','#1a1a10'],['Danau Darah',1800,0,600,800,'#1b0f14','#4a0a0a'],['Gereja Tua',0,800,800,800,'#18161e','#35313f'],['Kuburan Berkabut',800,800,800,800,'#13181b','#2c3338'],['Menara Terkutuk',1600,800,800,800,'#1b1119','#3a2538']];
const T={sh:{n:'Shadow Walker',hp:30,d:5,s:75,r:14,e:'#f22'},sp:{n:'Crimson Spider',hp:20,d:8,s:135,r:11,e:'#ff0'},bo:{n:'Bone Reaper',hp:80,d:15,s:45,r:21,e:'#f40'},gh:{n:'Weeping Ghost',hp:25,d:10,s:55,r:14,e:'#f00',fly:1},wo:{n:'Cursed Werewolf',hp:150,d:25,s:150,r:23,e:'#fc0'},bc:{n:'Bone Colossus',hp:120,d:18,s:48,r:24,e:'#f80'}};
const ZM=[['sh','sp'],['sp','sh'],['sh','sp'],['gh','gh'],['gh','bo'],['bo','sh'],['sp','gh']];
const LORE=['"Kabut datang bersama bulan merah." — Pak Lurah','"Ada lima artefak di desa ini. Mereka menjaganya."','"Cahaya senter membuat bayangan itu gentar."','"Anakku menghilang di peternakan..."','"Jangan lari terus. Kehabisan napas berarti mati."','"Lonceng gereja berbunyi sendiri tiap tengah malam."','"Mereka mendengar langkah kakimu."','"Serigala di menara dulunya manusia."','"Tiga serangan beruntun melukai lebih dalam."','"Fajar jam enam. Bertahanlah."'];
const TIPS=['Tiga serangan beruntun = CRITICAL x2.','Berlari menguras stamina dan menarik perhatian monster.','Kegelapan menggerus kewarasanmu. Tetap dekat cahaya.','Penjaga artefak lebih kuat. Kalahkan untuk mengambilnya.','Shadow Walker lemah terhadap cahaya senter.'];
const TS=['Gerakkan karakter (joystick / WASD)','Serang 3x dengan HIT (SPACE / J)','Kalahkan Shadow Walker — ikuti panah','Menghindar dengan DODGE (SHIFT)','Ambil Medkit lalu pakai (MED / E)','Ambil artefak untuk menyelesaikan latihan'];
function zoneAt(x,y){for(let i=0;i<7;i++){const z=ZN[i];if(x>=z[1]&&x<z[1]+z[3]&&y>=z[2]&&y<z[2]+z[4])return i}return 0}
function hitO(x,y,r){for(const o of OB)if(x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h)return 1;return 0}
function fp(z,minD=0){for(let i=0;i<60;i++){const q=ZN[z],x=q[1]+60+R()*(q[3]-120),y=q[2]+60+R()*(q[4]-120);if(!hitO(x,y,24)&&(!P||Math.hypot(x-P.x,y-P.y)>=minD))return{x,y}}return{x:ZN[z][1]+300,y:ZN[z][2]+300}}
function genWorld(){OB=[];DC=[];let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 ZN.forEach((q,z)=>{const n=z==2?16:z==5?12:5;for(let i=0;i<n;i++){const w=z==2?24:z==5?22:90+r()*70,h=z==2?24:z==5?30:70+r()*50;OB.push({x:q[1]+80+r()*(q[3]-160-w),y:q[2]+80+r()*(q[4]-160-h),w,h,z})}
  if(z==3)OB.push({x:q[1]+150,y:q[2]+280,w:300,h:240,z,lake:1});if(z==6)OB.push({x:q[1]+330,y:q[2]+300,w:140,h:200,z,tower:1})});
 OB=OB.filter(o=>!(o.x<460&&o.y<560&&o.x+o.w>150&&o.y+o.h>300&&!o.lake));
 for(let i=0;i<420;i++)DC.push({x:r()*WW,y:r()*WH,c:r(),s:2+r()*4})}
