/* ===== MONSTER AI ===== */
function mvE(e,dx,dy,f){const nx=cl(e.x+dx,e.r,WW-e.r),ny=cl(e.y+dy,e.r,WH-e.r);if(f||!hitO(nx,e.y,e.r))e.x=nx;if(f||!hitO(e.x,ny,e.r))e.y=ny}
const go=(m,s)=>{m.st=s;m.stt=0};
function inFlashlight(m){if(!P)return false;const d=dist(P,m);if(d>310)return false;const a=Math.atan2(m.y-P.y,m.x-P.x);const beam=.48;return Math.abs(angd(a,P.face))<=beam && d<300*(weather=='fog'?.82:1);}
function upM(m,dt){const d0=dist(P,m)||1,a=Math.atan2(P.y-m.y,P.x-m.x),T_=m.t,sp=T_.s*m.spd*(weather=='rain'?.9:weather=='storm'?1.1:1)*(1+wave*.03);m.stt+=dt;m.cd-=dt;m.fl-=dt;
 if(m.st=='death'){if(m.stt>.7)m.dead=1;return}
 if(m.k=='sh'){
  const lit=inFlashlight(m);
  if(lit){m.lightScared=1;m.rushT=0;m.st='lightFlee';m.stt=0;}
  else if(m.lightScared&&m.st!='lightFlee'&&m.st!='death'){m.lightScared=0;m.st='flashRush';m.stt=0;m.rushT=.9+R()*1.5;m.rushSpeed=2.7+R()*1.8;}
 }
 if(m.st=='lightFlee'){const away=a+PI;const flee=(T_.s*2.7+70)*dt;mvE(m,Math.cos(away)*flee,Math.sin(away)*flee,T_.fly);m.face=away;if(inFlashlight(m))return;m.lightScared=0;m.st='flashRush';m.stt=0;m.rushT=1.1+R()*1.4;m.rushSpeed=2.8+R()*1.7;return}
 if(m.st=='flashRush'){m.rushT-=dt;const rush=sp*m.rushSpeed;mvE(m,Math.cos(a)*rush*dt,Math.sin(a)*rush*dt,T_.fly);m.face=a;if(d0<m.r+P.r+14&&m.cd<=0){go(m,'attack');return}if(m.rushT<=0){go(m,'chase')}return}
 if(m.st=='hurt'){mvE(m,m.kx*dt,m.ky*dt,T_.fly);m.kx*=.88;m.ky*=.88;if(m.stt>.25)go(m,'chase');return}
 const sight=weather=='fog'?150:300;
 if(m.st=='idle'||m.st=='patrol'){if(m.st=='idle'&&m.stt>1.5){go(m,'patrol');m.pa=R()*7}if(m.st=='patrol'){mvE(m,Math.cos(m.pa)*30*dt,Math.sin(m.pa)*30*dt,T_.fly);m.face=m.pa;if(m.stt>2.2)go(m,'idle')}
  if(d0<sight*(P.sn<30?1.3:1)||(P.noise>0&&d0<230)){go(m,'alert');m.face=a;SFX.growl()}return}
 m.face=a;
 if(m.st=='alert'){if(m.stt>.5)go(m,'chase');return}
 if(m.st=='attack'){if(m.stt>.45){if(d0<m.r+P.r+30)dmgP(T_.d*(1+wave*.05)*(m.sc>1?1.2:1));m.cd=1.1;go(m,'chase')}return}
 if(m.dash>0){m.dash-=dt;mvE(m,Math.cos(m.da)*(m.k=='wo'?480:m.boss?420:400)*dt,Math.sin(m.da)*(m.k=='wo'?480:m.boss?420:400)*dt,T_.fly);if(d0<m.r+P.r+8&&m.cd<=0){go(m,'attack')}return}
 if(d0>sight*1.9){go(m,'patrol');return}
 if(m.k=='sp'&&m.hp<m.mh*.25&&d0<200){mvE(m,-Math.cos(a)*sp*dt,-Math.sin(a)*sp*dt);return}
 if(m.k=='sh'&&m.cd<=0&&d0>130){const q=R()*7;m.x=cl(P.x+Math.cos(q)*90,20,WW-20);m.y=cl(P.y+Math.sin(q)*90,20,WH-20);if(hitO(m.x,m.y,m.r)){m.x=P.x+120;m.y=P.y}m.cd=4;blood(m.x,m.y,6);return}
 if(m.k=='sp'&&m.cd<=0&&d0<200){m.dash=.25;m.da=a;m.cd=3;return}
 if(m.k=='wo'){if(m.cd<=0&&d0<320&&d0>90){m.dash=.3;m.da=a;m.cd=3.5;return}if(m.hp<m.mh*.5&&!m.howl){m.howl=1;M.forEach(q=>q.spd=1.25);SFX.howl();shake=10;say('Serigala melolong! Monster mengamuk!',3)}if(m.hp<m.mh)m.hp=Math.min(m.mh,m.hp+2*dt)}
 if(m.k=='bc'){if(m.cd<=0&&d0<260&&d0>100){m.dash=.38;m.da=a;m.cd=3.2;shake=Math.max(shake,7)}if(m.hp<m.mh*.6&&!m.howl){m.howl=1;SFX.howl();say('BONE COLOSSUS MENGAMUK!',3);M.forEach(q=>{if(q!=m)q.spd=Math.max(q.spd,1.2)})}}
 if(m.k=='gh'&&d0<300){if(m.cd<=0){m.cd=2;PR.push({x:m.x,y:m.y,vx:Math.cos(a)*170,vy:Math.sin(a)*170,t:3,d:T_.d});SFX.growl()}if(d0>140)mvE(m,Math.cos(a)*sp*dt,Math.sin(a)*sp*dt,1);return}
 if(d0<m.r+P.r+14&&m.cd<=0){go(m,'attack');return}
 if(d0>m.r+P.r+4){let ax=Math.cos(a),ay=Math.sin(a);const nx=m.x+ax*sp*dt*3,ny=m.y+ay*sp*dt*3;if(!T_.fly&&hitO(nx,ny,m.r)){const q=a+(m.pa>3?1:-1)*1.2;ax=Math.cos(q);ay=Math.sin(q)}mvE(m,ax*sp*dt,ay*sp*dt,T_.fly)}}
