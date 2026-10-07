/* ===== RENDER ===== */
function drawWorld(){const sx=(R()-.5)*shake,sy=(R()-.5)*shake;X.save();X.translate(-cam.x+sx|0,-cam.y+sy|0);
 if(INR)drawRoom();else ZN.forEach(z=>{X.fillStyle=z[5];X.fillRect(z[1],z[2],z[3],z[4]);X.strokeStyle='#0006';X.strokeRect(z[1],z[2],z[3],z[4])});
 for(const d of INR?[]:DC){if(d.x<cam.x-10||d.x>cam.x+W+10||d.y<cam.y-10||d.y>cam.y+H+10)continue;const z=zoneAt(d.x,d.y);X.fillStyle=d.c<.1&&z!=3?'#6a0808':d.c<.2?ZN[z][6]:'#0004';X.fillRect(d.x,d.y,d.s,d.s*(z==2?3:1))}
 const lt=ZN[3];X.fillStyle='#000';
 for(const o of INR?[]:OB){if(o.x>cam.x+W||o.x+o.w<cam.x||o.y>cam.y+H||o.y+o.h<cam.y)continue;
  if(o.lake){X.fillStyle='#5a0a12';X.fillRect(o.x,o.y,o.w,o.h);X.fillStyle='#8b1a22';for(let i=0;i<5;i++)X.fillRect(o.x+20+i*55,o.y+30+Math.sin(t*2+i)*8+i*30,40,3);continue}
  if(o.z==2){ci(o.x+12,o.y+12,14,'#1a120a');X.strokeStyle='#2a1c10';X.lineWidth=3;X.beginPath();X.moveTo(o.x+12,o.y+12);X.lineTo(o.x+30,o.y-20);X.moveTo(o.x+12,o.y+12);X.lineTo(o.x-6,o.y-14);X.stroke();continue}
  if(o.z==5){X.fillStyle='#4a5258';X.fillRect(o.x,o.y,o.w,o.h);X.fillStyle='#2a3036';X.fillRect(o.x+4,o.y+4,o.w-8,6);continue}
  const c=ZN[o.z][6];X.fillStyle=o.tower?'#2a1a2e':c;X.fillRect(o.x,o.y,o.w,o.h);X.fillStyle='#000a';X.fillRect(o.x,o.y+o.h-12,o.w,12);X.fillStyle='#000';X.fillRect(o.x+o.w/2-8,o.y+o.h-26,16,26);
  X.fillStyle='#0008';X.fillRect(o.x-6,o.y-10,o.w+12,14);if(o.z!=4){X.fillStyle=(t*3|0)%7?'#ffb30055':'#0000';X.fillRect(o.x+10,o.y+16,12,12)}if(o.z==4){X.fillStyle='#bbb';X.fillRect(o.x+o.w/2-2,o.y-40,4,30);X.fillRect(o.x+o.w/2-9,o.y-26,18,4)}}
 for(const n of NS)drawNest(n);for(const i of IT){const p=Math.sin(t*4)*3;X.shadowColor=i.k=='art'?'#ffd700':i.k=='med'?'#f44':'#8cf';X.shadowBlur=14;
  if(i.k=='med'){X.fillStyle='#eee';X.fillRect(i.x-8,i.y-6+p,16,12);X.fillStyle='#d00';X.fillRect(i.x-2,i.y-5+p,4,10);X.fillRect(i.x-7,i.y-1+p,14,3)}
  else if(i.k=='art'){X.fillStyle='#ffd700';X.beginPath();X.moveTo(i.x,i.y-14+p);X.lineTo(i.x+9,i.y+p);X.lineTo(i.x,i.y+14+p);X.lineTo(i.x-9,i.y+p);X.fill()}
  else if(i.k=='cd'){X.fillStyle='#ddd';X.fillRect(i.x-4,i.y-4,8,18);ci(i.x,i.y-8,i.lit?7:3,i.lit?'#fc3':'#555');X.fillStyle='#fff';X.font='12px Cinzel';X.textAlign='center';X.fillText(i.n,i.x,i.y+28)}else if(i.k=='chest'){X.fillStyle=ROOM.open?'#c9a227':'#5a3a1a';X.fillRect(i.x-16,i.y-10,32,22);X.fillStyle='#000';X.fillRect(i.x-3,i.y-2,6,8)}else if(i.k=='note'){X.fillStyle='#d8c39a';X.fillRect(i.x-7,i.y-9+p,14,18)}else{ci(i.x,i.y-8,8,'#9c8');X.fillStyle='#456';X.fillRect(i.x-8,i.y,16,16)}X.shadowBlur=0}
 const E=[...M.map(m=>({y:m.y,m})),{y:P.y,p:1}].sort((a,b)=>a.y-b.y);
 for(const e of E){if(e.p){if(S!='intro'||it>4.5||I.ctl)dP();else dPl()}else dM(e.m)}
 for(const p of PR){X.shadowColor='#f00';X.shadowBlur=10;ci(p.x,p.y,p.f?3:6,p.f?'#8f8':'#c00');X.shadowBlur=0}
 for(const f of FX){if(f.k=='p'){X.globalAlpha=Math.min(1,f.t*2);X.fillStyle=f.c;X.fillRect(f.x,f.y,f.s,f.s);X.globalAlpha=1}
  else if(f.k=='slash'){X.strokeStyle=f.c?'#ff5':'#fff';X.globalAlpha=f.t/.22;X.lineWidth=f.c?7:4;X.beginPath();X.arc(f.x,f.y,70,f.a-1.4,f.a+1.4);X.stroke();X.globalAlpha=1}
  else if(f.k=='spark'){X.fillStyle='#ff8';for(let i=0;i<6;i++){const a=i*1.05;X.fillRect(f.x+Math.cos(a)*(.15-f.t)*200,f.y+Math.sin(a)*(.15-f.t)*200,3,3)}}
  else if(f.k=='ring'){X.strokeStyle=f.c;X.lineWidth=5;X.globalAlpha=f.t/.4;X.beginPath();X.arc(f.x,f.y,f.r*(1.2-f.t/.4*.7),0,7);X.stroke();X.globalAlpha=1}else if(f.k=='bolt'){X.strokeStyle='#bdf';X.lineWidth=3;X.beginPath();let y=f.y-300;X.moveTo(f.x,y);while(y<f.y){y+=30;X.lineTo(f.x+(R()-.5)*40,y)}X.stroke()}}
 X.textAlign='center';for(const x of TX){X.globalAlpha=Math.min(1,x.t*2);X.font=`bold ${x.z}px Cinzel`;X.fillStyle=x.c;X.strokeStyle='#000';X.lineWidth=3;X.strokeText(x.s,x.x,x.y);X.fillText(x.s,x.x,x.y);X.globalAlpha=1}
 X.restore()}
function dPl(){X.save();X.translate(P.x,P.y);X.rotate(-1.4+Math.min(1,it/4.5)*1.4);ci(0,0,13,'#4a3b30');ci(0,-18,8,'#d8b99a');X.restore()}
function dP(){const b=Math.sin(t*(P.mv?16:2))*(P.mv?2.5:1.2),fx=Math.cos(P.face),fy=Math.sin(P.face);X.save();X.translate(P.x,P.y);
 X.fillStyle='#0007';X.beginPath();X.ellipse(0,12,14,6,0,0,7);X.fill();if(P.dd>0)X.globalAlpha=.5;if(P.inv>0&&P.dd<=0&&(t*20|0)%2)X.globalAlpha=.4;
 const ph=((t*(P.mv?12:3)|0)%8)/8*PI*2,lg=P.mv?Math.sin(ph)*4:0;X.fillStyle='#2b2b2b';X.fillRect(-8,4+lg,6,9);X.fillRect(2,4-lg,6,9);X.fillStyle='#d8b99a';X.fillRect(-14,-6+b-lg*.6,4,9);if(P.at<=0)X.fillRect(10,-6+b+lg*.6,4,9);if(P.hf>.3)X.rotate(.18);
 const sq=P.dd>0?.7:1;X.scale(1/sq,sq);ci(0,-4+b,12,playerProfile.skinUnlocked?'#8a6a20':getCurrentCharacterClass().color);ci(0,-18+b,8,'#d8b99a');
 if(fy>-.5){ci(fx*4-2.5,-18+b+fy*3,1.6,'#000');ci(fx*4+2.5,-18+b+fy*3,1.6,'#000')}else ci(0,-19+b,7,'#2a1a10');
 const sw=P.at>0?(1-P.at/.22)*2.2-1.1:.5;X.strokeStyle='#ccd';X.lineWidth=4;X.beginPath();X.moveTo(fx*10,-4+fy*8);X.lineTo(fx*10+Math.cos(P.face+sw)*30,-4+fy*8+Math.sin(P.face+sw)*30);X.stroke();X.restore()}
function dM(m){const T_=m.t,fx=Math.cos(m.face),fy=Math.sin(m.face),b=Math.sin(t*6+m.x)*2,r=m.r;X.save();X.translate(m.x,m.y);
 if(m.st=='death'){X.globalAlpha=1-m.stt/.7;X.rotate(m.stt*3);X.scale(1-m.stt*.4,1-m.stt*.4)}
 X.fillStyle='#0007';X.beginPath();X.ellipse(0,r*.7,r,r*.4,0,0,7);X.fill();
 if(m.guard){X.shadowColor='#ffd700';X.shadowBlur=18}
 const att=m.st=='attack'?1+m.stt*.5:1;X.scale(att,att);
 if(m.k=='sh'){X.globalAlpha*=.9;X.fillStyle='#10101a';X.beginPath();X.arc(0,-4,r,PI,0);for(let i=0;i<5;i++)X.lineTo(r-i*r*.5,r+Math.sin(t*8+i)*4);X.fill()}
 else if(m.k=='sp'){X.strokeStyle='#400';X.lineWidth=2;for(let i=0;i<8;i++){const s=i<4?-1:1,k=i%4;X.beginPath();X.moveTo(0,0);X.lineTo(s*(r+6),-8+k*6+Math.sin(t*20+i)*4);X.stroke()}ci(0,0,r,'#7a0a0a');ci(0,-8,6,'#500')}
 else if(m.k=='bo'){ci(0,0,r,'#2a2a22');X.fillStyle='#cbc5b0';for(let i=-2;i<3;i++)X.fillRect(i*6-1+Math.sin(t*30)*.7,-8,3,18);ci(0,-r+2,10,'#d8d2bc')}
 else if(m.k=='gh'){X.globalAlpha*=.65;const f=Math.sin(t*3)*4;X.fillStyle='#9bd';X.beginPath();X.arc(0,-6+f,r,PI,0);for(let i=0;i<4;i++)X.lineTo(r-i*r*.7,r+f+Math.sin(t*6+i)*3);X.fill();X.fillStyle='#c00';X.fillRect(-5,2+f,2,10);X.fillRect(3,2+f,2,10)}
 else{ci(0,0,r,'#3a2a22');ci(0,-r+2,r*.7,'#3a2a22');X.fillStyle='#3a2a22';X.beginPath();X.moveTo(-9,-r-2);X.lineTo(-5,-r-12);X.lineTo(-1,-r);X.moveTo(9,-r-2);X.lineTo(5,-r-12);X.lineTo(1,-r);X.fill()}
 X.shadowBlur=0;const ey=m.k=='sh'||m.k=='gh'||m.k=='sp'?-6:m.k=='bo'?-r+2:-r+2;X.shadowColor=T_.e;X.shadowBlur=8;ci(fx*3-4,ey+fy*2,2.4,T_.e);ci(fx*3+4,ey+fy*2,2.4,T_.e);X.shadowBlur=0;
 if(m.fl>0){X.globalAlpha=.8;ci(0,0,r+3,'#fff')}X.restore();
 if(m.hp<m.mh&&m.st!='death'){X.fillStyle='#000';X.fillRect(m.x-r,m.y-r-12,r*2,4);X.fillStyle='#b00';X.fillRect(m.x-r,m.y-r-12,r*2*m.hp/m.mh,4)}}
function post(){const hr=((18*60+gt)/60)%24,ds=S=='intro'?.5:weather=='eclipse'?.96:MODE=='classic'?dk(hr):.55,fog=weather=='fog';
 const L=post.L||(post.L=document.createElement('canvas'));L.width=W;L.height=H;const l=L.getContext('2d');l.fillStyle=`rgba(0,0,10,${Math.min(.96,ds+(fog?.1:0))})`;l.fillRect(0,0,W,H);l.globalCompositeOperation='destination-out';
 const px=P.x-cam.x,py=P.y-cam.y,fr=fog?.55:1;let g=l.createRadialGradient(px,py,5,px,py,100*fr);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(1,'rgba(0,0,0,0)');l.fillStyle=g;l.beginPath();l.arc(px,py,100*fr,0,7);l.fill();
 g=l.createRadialGradient(px,py,10,px,py,290*fr);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');l.fillStyle=g;l.beginPath();l.moveTo(px,py);l.arc(px,py,290*fr,P.face-.42,P.face+.42);l.fill();
 for(const i of IT){if(i.k=='art'||i.k=='npc'){const x=i.x-cam.x,y=i.y-cam.y;g=l.createRadialGradient(x,y,2,x,y,60);g.addColorStop(0,'rgba(0,0,0,.8)');g.addColorStop(1,'rgba(0,0,0,0)');l.fillStyle=g;l.fillRect(x-60,y-60,120,120)}}
 X.drawImage(L,0,0);
 if(weather=='fog'){X.fillStyle='rgba(120,120,130,.12)';X.fillRect(0,0,W,H)}
 if(weather=='rain'||weather=='storm'){X.strokeStyle='rgba(170,190,220,.35)';X.lineWidth=1;X.beginPath();for(let i=0;i<110;i++){const x=(i*97+t*300)%(W+60)-30,y=(i*53+t*700)%H;X.moveTo(x,y);X.lineTo(x-4,y+14)}X.stroke()}
 const hp=P.hp/P.mh;let v=X.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(${hp<.4?70:0},0,0,${.6+(1-hp)*.3+(P.sn<30?Math.sin(t*5)*.1:0)})`);X.fillStyle=v;X.fillRect(0,0,W,H);
 if(P.hf>0){X.fillStyle=`rgba(150,0,0,${P.hf*.5})`;X.fillRect(0,0,W,H)}
 if(flash>0){X.fillStyle=`rgba(220,230,255,${flash*.8})`;X.fillRect(0,0,W,H)}
 X.fillStyle='#fff1';for(let i=0;i<50;i++)X.fillRect(R()*W,R()*H,2,2)}
function hud(){const bar=(y,v,c,l)=>{X.fillStyle='#000a';X.fillRect(12,y,170,14);X.fillStyle=c;X.fillRect(13,y+1,168*cl(v,0,1),12);X.strokeStyle='#8b0000';X.lineWidth=2;X.strokeRect(12,y,170,14);X.fillStyle='#fff';X.font='10px Cinzel';X.textAlign='left';X.fillText(l,190,y+11)};
 bar(12,P.hp/P.mh,`hsl(0,80%,${30+Math.sin(t*8)*(P.hp<30?8:0)}%)`,'♥ HP');bar(32,P.st/100,'#c9a227','⚡ STAMINA');bar(52,P.sn/100,'#3a5a9a','👁 SANITY');
 X.fillStyle='#ffd700';X.font='13px Cinzel';X.textAlign='left';X.fillText(`Medkit ${P.meds}   Nyawa ${'♥'.repeat(Math.max(0,P.lives))}`,12,84);hud2();
 X.textAlign='center';X.font='16px Cinzel';
 if(MODE=='classic'){const hr=((18*60+gt)/60)%24,hh=hr|0,mm=(hr%1*60)|0;X.fillText(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} → 06:00   ·   Malam ${night}   ·   Artefak ${P.art}/5   ·   Gelombang ${wave}`,W/2,22);
  X.font='12px Cinzel';X.fillStyle='#caa';X.fillText(`${ZN[zoneAt(P.x,P.y)][0]}  ·  ${{clear:'Cerah',rain:'Hujan',fog:'Kabut',storm:'Badai',eclipse:'Gerhana'}[weather]}  ·  Penyintas ${P.rs}/3  ·  Catatan ${P.nt}/10`,W/2,40)}
 else{const desktop=!touch;const steps=desktop?TS:TS.map(v=>v.replace('joystick / WASD','joystick').replace('SPACE / J','HIT').replace('SHIFT','DODGE').replace('MED / E','MED'));X.fillText(`Langkah ${Math.min(tr+1,6)}/6`,W/2,22);X.font='14px Cinzel';X.fillStyle='#fff';X.fillText(steps[Math.min(tr,5)],W/2,44)}
 /* minimap perkamen */
 const mx=W-136,my=56,sx=124/WW,sy=84/WH;X.fillStyle='#d8c39acc';X.fillRect(mx-4,my-4,132,92);X.strokeStyle='#5a3a1a';X.strokeRect(mx-4,my-4,132,92);X.fillStyle='#5a3a1a55';ZN.forEach(z=>X.strokeRect(mx+z[1]*sx,my+z[2]*sy,z[3]*sx,z[4]*sy));
 IT.forEach(i=>{if(i.k=='art'){X.fillStyle='#b8860b';X.fillRect(mx+i.x*sx-2,my+i.y*sy-2,4,4)}});ci(mx+P.x*sx,my+P.y*sy,3,'#c00');X.fillStyle='#300';X.font='9px Cinzel';X.fillText('N',mx+62,my+8);
 if(msg){X.fillStyle='#000c';X.fillRect(W/2-300,H-70,600,34);X.strokeStyle='#8b0000';X.strokeRect(W/2-300,H-70,600,34);X.fillStyle='#ffd700';X.font='14px Cinzel';X.textAlign='center';X.fillText(msg.s,W/2,H-48)}
 if(MODE=='train'){const tg=tr==2?I.d:tr==4?I.m:tr==5?I.a:null;if(tg){const a=Math.atan2(tg.y-P.y,tg.x-P.x),d=dist(tg,P);let ax=tg.x-cam.x,ay=tg.y-cam.y-40;if(d>200||ax<0||ax>W||ay<0||ay>H){ax=cl(W/2+Math.cos(a)*200,30,W-30);ay=cl(H/2+Math.sin(a)*130,30,H-30)}X.save();X.translate(ax,ay+Math.sin(t*6)*4);X.rotate(d>200?a:PI/2);X.fillStyle='#ff0';X.beginPath();X.moveTo(14,0);X.lineTo(-8,-10);X.lineTo(-8,10);X.fill();X.restore()}}}
function face(){X.save();X.fillStyle='#000';X.fillRect(0,0,W,H);const z=1+(1-sc.t/.55)*.6;X.translate(W/2,H/2);X.scale(z,z);X.translate((R()-.5)*14,(R()-.5)*14);X.fillStyle='#1a0000';X.beginPath();X.ellipse(0,0,170,210,0,0,7);X.fill();
 X.fillStyle='#f00';X.shadowColor='#f00';X.shadowBlur=30;X.beginPath();X.ellipse(-60,-50,26,14,.3,0,7);X.ellipse(60,-50,26,14,-.3,0,7);X.fill();X.shadowBlur=0;X.fillStyle='#000';X.beginPath();X.ellipse(0,80,100,70,0,0,7);X.fill();X.fillStyle='#eee';for(let i=-4;i<5;i++){X.beginPath();X.moveTo(i*20-8,30);X.lineTo(i*20,70+(i%2?10:0));X.lineTo(i*20+8,30);X.fill()}X.restore();X.fillStyle=`rgba(180,0,0,${.4*sc.t})`;X.fillRect(0,0,W,H)}
