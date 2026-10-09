/*
 * ============================================================
 * SPRITES.JS — karakter 2D prosedural (tanpa file gambar)
 * ============================================================
 * Sprites.draw(ctx,id,{x,y,s,t,look,swing,wcolor})  -> karakter berdiri, origin di telapak kaki
 * Sprites.demo(ctx,id,kind,t,w,h)                  -> preview animasi senjata / skill
 * Sprites.icon(canvas,id)                          -> avatar kepala kecil
 */
const Sprites=(()=>{
  const TAU=Math.PI*2;
  const circ=(c,x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
  const rect=(c,x,y,w,h,col,r=0)=>{c.fillStyle=col;c.beginPath();if(r&&c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fill()};
  const poly=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()};
  const line=(c,x1,y1,x2,y2,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()};
  const SKIN='#e2bf9c';

  function eyes(c,look,y=-76,col='#222'){
    [-6,6].forEach(x=>{circ(c,x,y,3.6,'#fff');circ(c,x+look*1.8,y+.4,1.9,col)});
  }
  function legs(c,col,boot){rect(c,-10,-26,8,22,col,2);rect(c,2,-26,8,22,col,2);rect(c,-11,-6,10,6,boot,2);rect(c,1,-6,10,6,boot,2)}

  /* ---------- karakter ---------- */
  const figs={
    kn(c,o){
      legs(c,'#4a5568','#2d3748');
      rect(c,-17,-66,34,42,'#5a6a8a',6);rect(c,-12,-62,24,16,'#7d8fb3',4);rect(c,-17,-34,34,5,'#c9a227');
      circ(c,-18,-60,7,'#8a9ab8');circ(c,18,-60,7,'#8a9ab8');
      circ(c,0,-76,15,SKIN);eyes(c,o.look);
      c.fillStyle='#b8c2d6';c.beginPath();c.arc(0,-78,17,Math.PI,0);c.lineTo(17,-74);c.lineTo(-17,-74);c.closePath();c.fill();
      rect(c,-2,-92,4,18,'#8a96ad');
      c.fillStyle='#d32f2f';c.beginPath();c.moveTo(-3,-94);c.quadraticCurveTo(-18+Math.sin(o.t*3)*3,-108,-26,-90);c.quadraticCurveTo(-12,-96,-3,-90);c.fill();
      /* perisai */
      c.save();c.translate(-26,-44);c.fillStyle='#2b5fa8';c.beginPath();c.moveTo(-11,-14);c.lineTo(11,-14);c.lineTo(11,6);c.quadraticCurveTo(0,22,-11,6);c.closePath();c.fill();
      c.strokeStyle='#c9a227';c.lineWidth=2.5;c.stroke();rect(c,-2,-10,4,18,'#fff');rect(c,-7,-4,14,4,'#fff');c.restore();
      /* pedang */
      c.save();c.translate(20,-48);c.rotate(-.9+o.swing*2.3);
      rect(c,-3,-10,6,12,'#6b4a2a');rect(c,-8,-12,16,4,'#c9a227');
      rect(c,-3,-58,6,46,o.wcolor||'#e6ebf5',2);poly(c,[[-3,-58],[3,-58],[0,-66]],o.wcolor||'#e6ebf5');c.restore();
    },
    ma(c,o){
      poly(c,[[-15,-64],[15,-64],[24,-2],[-24,-2]],'#6a2c8a');rect(c,-24,-8,48,6,'#c9a227');rect(c,-15,-42,30,5,'#c9a227');
      circ(c,0,-74,15,SKIN);eyes(c,o.look);
      poly(c,[[-6,-62],[6,-62],[4,-40],[0,-34],[-4,-40]],'#ece7f5');
      poly(c,[[-20,-86],[20,-86],[4,-136],[-2,-136]],'#4b1d66');
      c.fillStyle='#3a1550';c.beginPath();c.ellipse(0,-86,26,6,0,0,TAU);c.fill();
      c.fillStyle='#ffd54a';c.beginPath();for(let i=0;i<10;i++){const r=i%2?3:7,a=-Math.PI/2+i*Math.PI/5;c.lineTo(Math.cos(a)*r,-108+Math.sin(a)*r)}c.fill();
      c.save();c.translate(28,-6);c.rotate(-o.swing*.5);line(c,0,0,0,-100,'#6b4a2a',4);
      const fire=Math.sin(o.t*3)>0,col=fire?'#ff8a2a':'#6fe6ff';
      c.shadowColor=col;c.shadowBlur=18;circ(c,0,-108,9+Math.sin(o.t*5)*1.4,col);circ(c,0,-108,4,'#fff');c.shadowBlur=0;c.restore();
      circ(c,22,-52,4.5,SKIN);
    },
    ar(c,o){
      legs(c,'#4a3b25','#2f2416');
      rect(c,-15,-64,30,40,'#3f7d3f',6);rect(c,-15,-36,30,5,'#6b4a2a');
      rect(c,10,-86,10,38,'#6b4a2a',2);[0,1,2].forEach(i=>poly(c,[[12+i*3,-86],[14+i*3,-86],[13+i*3,-96]],'#e8e8e8'));
      circ(c,0,-76,15,SKIN);eyes(c,o.look);
      c.fillStyle='#2e6a2e';c.beginPath();c.arc(0,-78,18,Math.PI*1.02,Math.PI*1.98);c.lineTo(15,-62);c.lineTo(-15,-62);c.closePath();c.fill();
      poly(c,[[-18,-78],[-24,-60],[-10,-66]],'#2e6a2e');
      rect(c,-14,-62,28,6,'#c9d6a0');
      /* busur */
      c.save();c.translate(-24,-48);c.strokeStyle='#8b5a2b';c.lineWidth=4;c.lineCap='round';
      const pull=o.swing*10;c.beginPath();c.moveTo(0,-34);c.quadraticCurveTo(-18-pull*.3,0,0,34);c.stroke();
      c.strokeStyle='#eee';c.lineWidth=1.4;c.beginPath();c.moveTo(0,-34);c.lineTo(-pull,0);c.lineTo(0,34);c.stroke();
      if(o.swing>.05&&o.swing<.8){line(c,-pull,0,28,0,o.wcolor||'#ddd',2.4);poly(c,[[28,0],[22,-3],[22,3]],'#bbb')}
      c.restore();circ(c,-24,-48,4.5,SKIN);
    },
    ro(c,o){
      legs(c,'#2a2230','#16121a');
      poly(c,[[-14,-64],[14,-64],[17,-24],[-17,-24]],'#5a1f26');
      poly(c,[[-16,-62],[-30,-14+Math.sin(o.t*4)*2],[-8,-26]],'#3d1519');
      circ(c,0,-76,15,SKIN);
      c.fillStyle='#4a171d';c.beginPath();c.arc(0,-78,18,Math.PI,0);c.lineTo(15,-70);c.lineTo(-15,-70);c.closePath();c.fill();
      rect(c,-15,-72,30,14,'#241014',3);
      [-6,6].forEach(x=>{circ(c,x,-77,3.2,'#fff');circ(c,x+o.look*1.6,-77,1.7,'#c00')});
      [0,1].forEach(i=>{c.save();c.translate(i?20:-20,-44);c.rotate((i?.5:-.5)+(i?1:-1)*Math.sin(o.swing*Math.PI)*1.4);
        rect(c,-2,-6,4,8,'#4a3320');rect(c,-1.5,-30,3,24,o.wcolor||'#dfe6ee');poly(c,[[-1.5,-30],[1.5,-30],[0,-36]],o.wcolor||'#dfe6ee');c.restore()});
    },
    pr(c,o){
      poly(c,[[-14,-64],[14,-64],[22,-2],[-22,-2]],'#f2eddc');rect(c,-22,-8,44,6,'#d9b84a');rect(c,-3,-62,6,56,'#d9b84a');
      circ(c,0,-74,15,SKIN);eyes(c,o.look);
      c.fillStyle='#e8d38a';c.beginPath();c.arc(0,-78,16,Math.PI,0);c.quadraticCurveTo(14,-66,15,-62);c.lineTo(-15,-62);c.quadraticCurveTo(-14,-66,-16,-78);c.fill();
      c.strokeStyle='#ffe066';c.lineWidth=3;c.shadowColor='#ffe066';c.shadowBlur=14;c.beginPath();c.ellipse(0,-98+Math.sin(o.t*3)*1.5,15,4.5,0,0,TAU);c.stroke();c.shadowBlur=0;
      c.save();c.translate(26,-6);c.rotate(-o.swing*.4);line(c,0,0,0,-96,'#a0782a',4);
      c.shadowColor='#ffe066';c.shadowBlur=16;circ(c,0,-104,8,'#ffe066');c.shadowBlur=0;
      for(let i=0;i<8;i++){const a=i*TAU/8+o.t;line(c,Math.cos(a)*9,-104+Math.sin(a)*9,Math.cos(a)*14,-104+Math.sin(a)*14,'#ffe066',2)}c.restore();
      circ(c,23,-50,4.5,SKIN);
      for(let i=0;i<4;i++){const a=o.t*1.3+i*1.6;c.globalAlpha=.6+.4*Math.sin(a*2);circ(c,Math.cos(a)*34,-60+Math.sin(a*1.4)*26,1.8,'#fff6b0')}c.globalAlpha=1;
    },
    be(c,o){
      legs(c,'#5b3a1e','#2b1b0e');
      rect(c,-18,-66,36,42,'#d9a066',6);rect(c,-18,-36,36,8,'#6b3a12');rect(c,-14,-60,28,12,'#b97a3a',4);
      circ(c,-20,-60,9,'#8a8a92');circ(c,20,-60,9,'#8a8a92');
      circ(c,0,-76,15,SKIN);eyes(c,o.look);
      rect(c,-10,-70,20,3,'#b71c1c');
      [[-14,-86,-22,-104],[-6,-90,-8,-110],[4,-90,8,-110],[13,-86,22,-104]].forEach(p=>poly(c,[[p[0]-4,p[1]+4],[p[2],p[3]],[p[0]+5,p[1]+4]],'#c62828'));
      c.fillStyle='#c62828';c.beginPath();c.arc(0,-82,16,Math.PI,0);c.fill();
      c.save();c.translate(22,-48);c.rotate(-1.1+o.swing*2.8);
      rect(c,-3,-70,6,76,'#6b4a2a');
      poly(c,[[3,-70],[34,-80],[34,-44],[3,-52]],o.wcolor||'#c9d0da');poly(c,[[-3,-70],[-30,-78],[-30,-46],[-3,-52]],o.wcolor||'#c9d0da');c.restore();
    }
  };

  function draw(c,id,o={}){
    const op=Object.assign({x:0,y:0,s:1,t:0,look:0,swing:0,wcolor:null},o);
    c.save();c.translate(op.x,op.y);c.scale(op.s,op.s);
    (figs[id]||figs.kn)(c,op);
    c.restore();
  }

  /* avatar kecil (kepala + bahu) */
  function icon(canvas,id){
    const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
    const g=c.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);g.addColorStop(0,'#3a0a0a');g.addColorStop(1,'#120303');c.fillStyle=g;c.fillRect(0,0,w,h);
    const s=h/72;c.save();c.beginPath();c.rect(0,0,w,h);c.clip();draw(c,id,{x:w/2,y:h*.5+82*s*.62+2,s:s*1.02*.78,t:0});c.restore();
  }

  /* ---------- preview senjata & skill ---------- */
  function dummy(c,x,y,flash,stun,t){
    c.save();c.translate(x,y);
    c.fillStyle='#0006';c.beginPath();c.ellipse(0,0,20,6,0,0,TAU);c.fill();
    circ(c,0,-22,18,flash?'#fff':'#5d7a3a');rect(c,-10,-40,20,6,'#3e2f1e',2);circ(c,-6,-26,3,'#f80');circ(c,6,-26,3,'#f80');
    if(stun){for(let i=0;i<3;i++){const a=t*5+i*2.1;circ(c,Math.cos(a)*16,-48+Math.sin(a)*4,3,'#ffd54a')}}
    c.restore();
  }
  function demo(c,id,kind,t,w,h,wcolor){
    c.clearRect(0,0,w,h);
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1c0d14');g.addColorStop(1,'#0a0505');c.fillStyle=g;c.fillRect(0,0,w,h);
    const gy=h*.82;c.fillStyle='#1a0f0f';c.fillRect(0,gy,w,h-gy);
    const per=1.8,u=(t%per)/per,cx=w*.2,tx=w*.78,s=Math.min(.5,h/230);
    const me={x:cx,y:gy,s,t,look:.6,swing:0,wcolor};
    let fx=null,flash=false,stun=false,hide=false;
    const type=(CHARACTER_CLASSES.find(k=>k.id===id)||{}).attack.type;
    const ay=gy-40*s*2;
    if(kind==='weapon'){
      if(type==='slash'){me.swing=Math.min(1,Math.max(0,(u-.1)/.25));fx=()=>{if(u>.2&&u<.55){c.globalAlpha=1-(u-.2)/.35;c.strokeStyle=wcolor||'#fff';c.lineWidth=6;c.beginPath();c.arc(cx+10,ay,w*.34,-1.2,1.2);c.stroke();c.globalAlpha=1}};flash=u>.3&&u<.4}
      else if(type==='cleave'){me.swing=Math.min(1,Math.max(0,(u-.1)/.3));fx=()=>{if(u>.2&&u<.6){c.globalAlpha=1-(u-.2)/.4;c.strokeStyle=wcolor||'#ffb070';c.lineWidth=8;c.beginPath();c.arc(cx,ay,w*.28*(.6+u),0,TAU);c.stroke();c.globalAlpha=1}};flash=u>.3&&u<.4}
      else if(type==='stab'){me.swing=(u%.5)<.2?(u%.5)/.2:0;fx=()=>{[.2,.45].forEach(k=>{if(u>k&&u<k+.12){c.strokeStyle=wcolor||'#fff';c.lineWidth=4;const x=tx-30;line(c,x-14,ay-12,x+14,ay+12,c.strokeStyle,4);line(c,x-14,ay+12,x+14,ay-12,c.strokeStyle,4)}})};flash=(u>.2&&u<.3)||(u>.45&&u<.55)}
      else{
        me.swing=u<.25?u/.25:Math.max(0,1-(u-.25)/.2);
        const el=type==='bolt'?(Math.floor(t/per)%2?'#6fe6ff':'#ff8a2a'):type==='holy'?'#ffe066':(wcolor||'#e8e8e8');
        fx=()=>{if(u>.25&&u<.6){const p=(u-.25)/.35,x=cx+20+(tx-cx-40)*p;
          if(type==='arrow'){line(c,x-34,ay,x,ay,el,3);poly(c,[[x,ay],[x-8,ay-4],[x-8,ay+4]],'#ccc')}
          else{c.shadowColor=el;c.shadowBlur=16;circ(c,x,ay,9,el);circ(c,x,ay,4,'#fff');c.shadowBlur=0;for(let i=1;i<4;i++){c.globalAlpha=.3/i;circ(c,x-i*10,ay,7-i,el)}c.globalAlpha=1}}
          if(u>.6&&u<.75&&type==='bolt'){c.globalAlpha=1-(u-.6)/.15;c.strokeStyle=Math.floor(t/per)%2?'#6fe6ff':'#ff8a2a';c.lineWidth=4;c.beginPath();c.arc(tx,ay,40*(u-.5)*5,0,TAU);c.stroke();c.globalAlpha=1}};
        flash=u>.58&&u<.68;stun=type==='bolt'&&Math.floor(t/per)%2===1&&u>.6&&u<.95;
      }
    }else{
      const sw=Math.min(1,Math.max(0,(u-.1)/.2));
      if(id==='kn'){me.swing=sw;fx=()=>{const p=Math.max(0,(u-.2)/.5);if(u>.15&&u<.85){c.globalAlpha=1-p;c.strokeStyle='#8cf';c.lineWidth=5;c.beginPath();c.arc(cx,ay,34+p*w*.45,0,TAU);c.stroke();c.globalAlpha=1}
        c.globalAlpha=.35+.2*Math.sin(t*10);c.fillStyle='#8cf';c.beginPath();c.arc(cx,ay,34,0,TAU);c.fill();c.globalAlpha=1};flash=u>.45&&u<.55;stun=u>.5&&u<.95}
      else if(id==='ma'){me.swing=sw;fx=()=>{const p=Math.max(0,(u-.2)/.5);if(u>.2&&u<.8){c.globalAlpha=1-p;c.strokeStyle='#c6f';c.lineWidth=7;c.beginPath();c.arc(cx,ay,20+p*w*.7,0,TAU);c.stroke();c.strokeStyle='#6fe6ff';c.lineWidth=3;c.beginPath();c.arc(cx,ay,10+p*w*.55,0,TAU);c.stroke();c.globalAlpha=1}};flash=u>.5&&u<.58;stun=u>.55}
      else if(id==='ar'){me.swing=sw;fx=()=>{if(u>.25&&u<.7){const p=(u-.25)/.45;for(let i=-2;i<=2;i++){const x=cx+30+(tx-cx)*p,y=ay+i*p*16;line(c,x-26,y,x,y,'#cfe8c0',2.6);poly(c,[[x,y],[x-7,y-3],[x-7,y+3]],'#ddd')}}};flash=u>.65&&u<.75}
      else if(id==='ro'){hide=u>.25&&u<.45;me.x=u>.45?tx-48:cx;me.swing=u>.5?Math.min(1,(u-.5)/.2):0;fx=()=>{if(u>.2&&u<.5){for(let i=0;i<8;i++){circ(c,(u<.35?cx:tx-48)+Math.cos(i+t*9)*18,gy-30+Math.sin(i*2+t*9)*24,3,'#7a2a4a')}}
        if(u>.5&&u<.7){line(c,tx-40,ay-16,tx-4,ay+14,'#ff5a5a',5);line(c,tx-40,ay+14,tx-4,ay-16,'#ff5a5a',5)}};flash=u>.5&&u<.6}
      else if(id==='pr'){me.swing=sw;fx=()=>{const p=Math.max(0,(u-.2)/.6);if(u>.2&&u<.9){c.globalAlpha=1-p;c.strokeStyle='#ffe066';c.lineWidth=4;c.beginPath();c.arc(cx,ay,20+p*w*.35,0,TAU);c.stroke();c.globalAlpha=1;c.fillStyle='#7dff7d';c.font='bold 22px Cinzel,serif';c.textAlign='center';
        for(let i=0;i<4;i++)c.fillText('+',cx-30+i*20,ay-10-p*50-(i%2)*14)}};flash=u>.45&&u<.55}
      else{me.swing=Math.sin(t*14)*.4+.4;fx=()=>{if(u>.15){c.globalAlpha=.55+.25*Math.sin(t*14);for(let i=0;i<7;i++){const a=t*4+i*.9;circ(c,cx+Math.cos(a)*26,ay+Math.sin(a*1.3)*30-6,5,i%2?'#ff6a1a':'#ffb347')}c.globalAlpha=1;c.fillStyle='#ff6a1a';c.font='bold 18px Cinzel,serif';c.textAlign='center';c.fillText('DMG x2',cx,ay-70)}};flash=u>.3&&u<.36}
    }
    c.fillStyle='#0006';c.beginPath();c.ellipse(me.x,gy,26*s*2,6,0,0,TAU);c.fill();
    if(!hide)draw(c,id,me);
    dummy(c,tx,gy,flash,stun,t);
    if(fx)fx();
  }

  return{draw,icon,demo,circ,rect,poly,line};
})();
