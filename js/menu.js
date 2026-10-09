/* ===== MENU & INTRO ===== */
function menuScene(){const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0000');g.addColorStop(1,'#0a0a0a');X.fillStyle=g;X.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){X.fillStyle='#fff6';X.fillRect((i*137)%W,(i*71)%250,1.5,1.5)}ci(720,110,44,'#8b0000');ci(720,110,52,'#8b000030');
 [['#120808',.2,330],['#0d0505',.5,400],['#070303',1,460]].forEach(([c,sp,y],k)=>{X.fillStyle=c;X.beginPath();X.moveTo(0,H);for(let x=0;x<=W;x+=20)X.lineTo(x,y-Math.sin((x+t*20*sp)*.015*(k+1))*30-k*10);X.lineTo(W,H);X.fill()});
 X.fillStyle='rgba(160,150,170,.07)';for(let i=0;i<4;i++)X.fillRect(((t*15*(i+1))%(W+400))-300,300+i*40,400,40);
 if(weather=='rain'){X.strokeStyle='#8ab5';X.beginPath();for(let i=0;i<90;i++){const x=(i*91+t*200)%W,y=(i*47+t*600)%H;X.moveTo(x,y);X.lineTo(x-3,y+12)}X.stroke()}
 for(const f of fireflies){f.x+=Math.sin(t+f.p)*.4;f.y+=Math.cos(t*.7+f.p)*.3;ci(f.x,f.y,2,`rgba(255,220,80,${.5+Math.sin(t*3+f.p)*.5})`)}
 const cid=getCurrentCharacterClass().id,fl=Math.sin(t*2)*4;X.fillStyle='#0008';X.beginPath();X.ellipse(200,478,36-fl*.6,9,0,0,7);X.fill();
 Sprites.draw(X,cid,{x:200,y:474+fl,s:1.25,t,look:Math.sin(t*.7),swing:((t%5)>4.3)?((t%5)-4.3)/.7:0,wcolor:Loadout.mods().color})}
function introScene(){const k=it;let s;X.fillStyle='#000';
 if(k<3){X.save();X.globalAlpha=Math.min(1,k/1.5);X.fillStyle='#b30000';X.font='46px Creepster';X.textAlign='center';X.fillText('MALAM KELAM',W/2,H/2-10);X.fillText('DI DESA TERKUTUK',W/2,H/2+40);X.fillStyle='#8b0000';for(let i=0;i<9;i++){const x=W/2-200+i*50,l=Math.min(1,k/3)*(20+(i*37%40));X.fillRect(x,H/2+48,3,l);ci(x+1.5,H/2+48+l,3,'#8b0000')}X.restore()}
 if(k>=3&&k<8){X.fillStyle=`rgba(0,0,0,${k<5?.85:.85-(k-5)*.2})`;X.fillRect(0,0,W,H);X.fillStyle='#ccc';X.font='italic 17px Cinzel';X.textAlign='center';['Kau terbangun di desa yang kau kenal... tapi kini tertimbun sampah.','Kabut menyelimuti, bulan berwarna darah, tangisan terdengar dari kejauhan.','Cari 5 artefak kuno, buka gerbang desa... sebelum Monster Sampah menemukanmu.'].forEach((l,i)=>{const a=cl((k-3-i*1.3)/.8,0,1);X.globalAlpha=a;X.fillText(l,W/2,H-110+i*26)});X.globalAlpha=1}
 if(k>=8&&k<15){X.fillStyle='#ffd700';X.font='20px Cinzel';X.textAlign='center';X.fillText('Bertahan hidup!',W/2,60);X.font='64px Cinzel';X.fillStyle='#b30000';X.fillText(Math.ceil(15-k),W/2,130)}
 if(k>=18){X.fillStyle=`rgba(0,0,0,${Math.min(1,(k-18)/1.2)})`;X.fillRect(0,0,W,H);X.fillStyle='#ffd700';X.font='30px Cinzel';X.textAlign='center';X.fillText('Apakah kamu siap?',W/2,H/2)}
 if(k<8||k>=15){X.fillStyle='#000';const bh=k<8?60:0;X.fillRect(0,0,W,bh);X.fillRect(0,H-bh,W,bh)}
 if(!fsDone&&k>1){X.fillStyle='#fff7';X.font='11px Cinzel';X.textAlign='center';X.fillText('Sentuh layar untuk suara & layar penuh',W/2,H-14)}}
