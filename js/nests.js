/* ===== SARANG MONSTER ===== */
function hitN(n,d){n.hp-=d;n.fl=.1;blood(n.x,n.y,5);SFX.hit();if(n.hp<=0&&!n.dead){n.dead=1;addScore(40*night);updatePlayerStat('nest',1);SFX.die();shake=Math.max(shake,6);say(`Tumpukan sampah dibersihkan! Tersisa ${NS.filter(q=>!q.dead).length}`,2)}}
function drawNest(n){const p=1+Math.sin(t*3+n.t)*.06;X.save();X.translate(n.x,n.y);X.scale(p,p);X.fillStyle='#0008';X.beginPath();X.ellipse(0,14,22,8,0,0,7);X.fill();
 const f=n.fl>0;ci(0,2,17,f?'#fff':'#2f4a2a');ci(-9,6,10,f?'#fff':'#3e5e36');ci(9,7,9,f?'#fff':'#233a22');X.fillStyle=f?'#fff':'#cfd8dc';X.fillRect(-4,-20,5,12);X.fillStyle=f?'#fff':'#d32f2f';X.fillRect(8,-3,8,5);
 ci(-5,-2,2.6,'#cf0');ci(5,-2,2.6,'#cf0');X.fillStyle='#1b3d08';X.fillRect(-4,5,8,2);X.restore();X.fillStyle='#000';X.fillRect(n.x-16,n.y-28,32,4);X.fillStyle='#76c11a';X.fillRect(n.x-16,n.y-28,32*Math.max(0,n.hp/40),4)}
