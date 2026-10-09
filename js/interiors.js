/* ===== INTERIOR BANGUNAN ===== */
function doorNear(){if(MODE!='classic'||S!='play')return 0;if(INR)return P.y>WH-70&&Math.abs(P.x-WW/2)<50?'exit':0;for(const o of OB)if((o.z==0||o.z==1||o.z==4)&&!o.lake&&!o.tower&&Math.abs(P.x-(o.x+o.w/2))<44&&P.y>o.y+o.h-4&&P.y<o.y+o.h+56)return o;return 0}
function useDoor(){const d=doorNear();if(!d)return;SFX.door();FD=1;d==='exit'?leave():enter(d)}
function enter(o){updatePlayerStat('room',1);OUT={M,IT,OB,NS,PR,x:P.x,y:P.y+10,WW,WH};INR=1;WW=960;WH=540;
 OB=[{x:0,y:0,w:960,h:70},{x:0,y:0,w:40,h:540},{x:920,y:0,w:40,h:540},{x:150,y:150,w:120,h:50},{x:690,y:150,w:120,h:50},{x:400,y:300,w:160,h:40}];
 ROOM={z:o.z,next:1,open:0};const q=[1,2,3].sort(()=>R()-.5);M=[];PR=[];NS=[];
 IT=[{k:'cd',n:q[0],x:200,y:420},{k:'cd',n:q[1],x:480,y:440},{k:'cd',n:q[2],x:760,y:420},{k:'chest',x:480,y:110},{k:'med',x:100,y:300},{k:'note',x:860,y:300,i:R()*10|0}];
 const ty=o.z==0?['sh','sh']:o.z==1?['bo','sp']:['gh','gh','sh'];ty.forEach((k,i)=>{const m=mk(k,300+i*150,200+R()*60,.9*getNightDifficultyMultiplier());if(o.z==1&&i==0)m.guard=1;M.push(m)});
 P.x=480;P.y=400;P.dd=0;say('Urutkan lilin 1 → 2 → 3 untuk membuka peti!',5)}
function leave(){if(!OUT)return;({M,IT,OB,NS,PR}=OUT);P.x=OUT.x;P.y=OUT.y;WW=OUT.WW;WH=OUT.WH;INR=0;OUT=null}
function cdTouch(it){I.cdc=.6;if(it.n==ROOM.next){it.lit=1;ROOM.next++;SFX.pick();if(ROOM.next>3){ROOM.open=1;SFX.lvl();say('Peti terbuka!',2)}}else{ROOM.next=1;IT.forEach(i=>{if(i.k=='cd')i.lit=0});P.sn=Math.max(0,P.sn-12);SFX.scare();const m=mk('sh',P.x+80,P.y-60,1);go(m,'chase');M.push(m);say('Urutan salah! Bayangan terbangun...',3)}}
function drawRoom(){const c=['#2a1a12','#3a2f12','#25222d'][ROOM.z==0?0:ROOM.z==1?1:2];X.fillStyle=c;X.fillRect(0,0,960,540);X.fillStyle='#0003';for(let y=60;y<540;y+=30)X.fillRect(0,y,960,2);OB.forEach((o,i)=>{X.fillStyle=i<3?'#0c0806':'#4a3220';X.fillRect(o.x,o.y,o.w,o.h)});X.fillStyle='#ffd70033';X.fillRect(WW/2-40,WH-20,80,20);X.fillStyle='#ffd700';X.font='11px Cinzel';X.textAlign='center';X.fillText('KELUAR',WW/2,WH-6)}
function hud2(){const mu=(1+Math.min(4,P.sk/3|0))*(weather=='eclipse'?2:1);X.textAlign='left';
 if(MODE=='classic'){X.fillStyle='#fff';X.font='bold 15px Cinzel';X.fillText('SKOR '+(score|0),12,104);X.font='12px Cinzel';X.fillStyle=mu>1?'#ff6':'#caa';X.fillText(`x${mu}  streak ${P.sk}  ·  Rank ${rankText(Math.max(playerProfile.bestScore,score|0))}  ·  Tumpukan ${NS.length}`,12,121)}
 X.fillStyle=P.scd>0?'#777':'#8f8';X.font='12px Cinzel';X.fillText(P.scd>0?`${getCurrentCharacterClass().skillName} ${Math.ceil(P.scd)}s`:`${getCurrentCharacterClass().skillName} SIAP (K)`,12,138);
 const dn=doorNear();if(dn){X.textAlign='center';X.fillStyle='#ffd700';X.font='14px Cinzel';X.fillText(dn==='exit'?'[F] Keluar':'[F] Masuk bangunan',W/2,H-90)}if(touch)$('#bI').style.display=dn?'block':'none'}
