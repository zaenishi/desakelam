/* ===== RENDER ===== */
function drawWorld() {
  const sx =(randomValue() - .5) * screenShake,
  sy =(randomValue() - .5) * screenShake;
  gameCanvasContext.save();
  gameCanvasContext.translate( - camera.x + sx|0, - camera.y + sy|0);
  if(isInsideRoom)drawRoom();
  else zones.forEach(z => {
    gameCanvasContext.fillStyle = z[5]; gameCanvasContext.fillRect(z[1], z[2], z[3], z[4]); gameCanvasContext.strokeStyle = '#0006'; gameCanvasContext.strokeRect(z[1], z[2], z[3], z[4])
  });
  for(const d of isInsideRoom?[]:doorCollisions) {
    if(d.x < camera.x - 10 || d.x > camera.x + canvasWidthValue + 10 || d.y < camera.y - 10 || d.y > camera.y + canvasHeightValue + 10)continue;
    const z = zoneAt(d.x, d.y);
    gameCanvasContext.fillStyle = d.c < .1 && z != 3?'#6a0808':d.c < .2?zones[z][6]:'#0004';
    gameCanvasContext.fillRect(d.x, d.y, d.s, d.s *(z == 2?3:1))
  }
  const lt = zones[3];
  gameCanvasContext.fillStyle = '#000';
  for(const o of isInsideRoom?[]:obstacles) {
    if(o.x > camera.x + canvasWidthValue || o.x + o.w < camera.x || o.y > camera.y + canvasHeightValue || o.y + o.h < camera.y)continue;
    if(o.lake) {
      gameCanvasContext.fillStyle = '#5a0a12';
      gameCanvasContext.fillRect(o.x, o.y, o.w, o.h);
      gameCanvasContext.fillStyle = '#8b1a22';
      for(let i = 0; i < 5; i++)gameCanvasContext.fillRect(o.x + 20 + i * 55, o.y + 30 + Math.sin(t * 2 + i) * 8 + i * 30, 40, 3);
      continue
    }
    if(o.z == 2) {
      fillCircle(o.x + 12, o.y + 12, 14, '#1a120a');
      gameCanvasContext.strokeStyle = '#2a1c10';
      gameCanvasContext.lineWidth = 3;
      gameCanvasContext.beginPath();
      gameCanvasContext.moveTo(o.x + 12, o.y + 12);
      gameCanvasContext.lineTo(o.x + 30, o.y - 20);
      gameCanvasContext.moveTo(o.x + 12, o.y + 12);
      gameCanvasContext.lineTo(o.x - 6, o.y - 14);
      gameCanvasContext.stroke();
      continue
    }
    if(o.z == 5) {
      gameCanvasContext.fillStyle = '#4a5258';
      gameCanvasContext.fillRect(o.x, o.y, o.w, o.h);
      gameCanvasContext.fillStyle = '#2a3036';
      gameCanvasContext.fillRect(o.x + 4, o.y + 4, o.w - 8, 6);
      continue
    }
    const c = zones[o.z][6];
    gameCanvasContext.fillStyle = o.tower?'#2a1a2e':c;
    gameCanvasContext.fillRect(o.x, o.y, o.w, o.h);
    gameCanvasContext.fillStyle = '#000a';
    gameCanvasContext.fillRect(o.x, o.y + o.h - 12, o.w, 12);
    gameCanvasContext.fillStyle = '#000';
    gameCanvasContext.fillRect(o.x + o.w / 2 - 8, o.y + o.h - 26, 16, 26);
    gameCanvasContext.fillStyle = '#0008';
    gameCanvasContext.fillRect(o.x - 6, o.y - 10, o.w + 12, 14);
    if(o.z != 4) {
      gameCanvasContext.fillStyle =(t * 3|0) % 7?'#ffb30055':'#0000';
      gameCanvasContext.fillRect(o.x + 10, o.y + 16, 12, 12)
    }
    if(o.z == 4) {
      gameCanvasContext.fillStyle = '#bbb';
      gameCanvasContext.fillRect(o.x + o.w / 2 - 2, o.y - 40, 4, 30);
      gameCanvasContext.fillRect(o.x + o.w / 2 - 9, o.y - 26, 18, 4)
    }
  }
  for(const n of spawnedMonsterNests)drawNest(n);
  for(const i of items) {
    const p = Math.sin(t * 4) * 3;
    gameCanvasContext.shadowColor = i.k == 'art'?'#ffd700':i.k == 'med'?'#f44':'#8cf';
    gameCanvasContext.shadowBlur = 14;
    if(i.k == 'med') {
      gameCanvasContext.fillStyle = '#eee';
      gameCanvasContext.fillRect(i.x - 8, i.y - 6 + p, 16, 12);
      gameCanvasContext.fillStyle = '#d00';
      gameCanvasContext.fillRect(i.x - 2, i.y - 5 + p, 4, 10);
      gameCanvasContext.fillRect(i.x - 7, i.y - 1 + p, 14, 3)
    } else if(i.k == 'art') {
      gameCanvasContext.fillStyle = '#ffd700';
      gameCanvasContext.beginPath();
      gameCanvasContext.moveTo(i.x, i.y - 14 + p);
      gameCanvasContext.lineTo(i.x + 9, i.y + p);
      gameCanvasContext.lineTo(i.x, i.y + 14 + p);
      gameCanvasContext.lineTo(i.x - 9, i.y + p);
      gameCanvasContext.fill()
    } else if(i.k == 'cd') {
      gameCanvasContext.fillStyle = '#ddd';
      gameCanvasContext.fillRect(i.x - 4, i.y - 4, 8, 18);
      fillCircle(i.x, i.y - 8, i.lit?7:3, i.lit?'#fc3':'#555');
      gameCanvasContext.fillStyle = '#fff';
      gameCanvasContext.font = '12px Cinzel';
      gameCanvasContext.textAlign = 'center';
      gameCanvasContext.fillText(i.n, i.x, i.y + 28)
    } else if(i.k == 'chest') {
      gameCanvasContext.fillStyle = roomState.open?'#c9a227':'#5a3a1a';
      gameCanvasContext.fillRect(i.x - 16, i.y - 10, 32, 22);
      gameCanvasContext.fillStyle = '#000';
      gameCanvasContext.fillRect(i.x - 3, i.y - 2, 6, 8)
    } else if(i.k == 'note') {
      gameCanvasContext.fillStyle = '#d8c39a';
      gameCanvasContext.fillRect(i.x - 7, i.y - 9 + p, 14, 18)
    } else {
      fillCircle(i.x, i.y - 8, 8, '#9c8');
      gameCanvasContext.fillStyle = '#456';
      gameCanvasContext.fillRect(i.x - 8, i.y, 16, 16)
    }
    gameCanvasContext.shadowBlur = 0
  }
  const E =[...monsters.map(m =>({
    y:m.y, m
  })), {
    y:player.y, p:1
  }].sort((a, b) => a.y - b.y);
  for(const e of E) {
    if(e.p) {
      if(gameState != 'intro' || it > 4.5 || runtimeState.ctl)dP();
      else dPl()
    } else dM(e.m)
  }
  for(const p of projectiles) {
    gameCanvasContext.shadowColor = '#f00';
    gameCanvasContext.shadowBlur = 10;
    fillCircle(p.x, p.y, p.f?3:6, p.f?'#8f8':'#c00');
    gameCanvasContext.shadowBlur = 0
  }
  for(const f of effects) {
    if(f.k == 'p') {
      gameCanvasContext.globalAlpha = Math.min(1, f.t * 2);
      gameCanvasContext.fillStyle = f.c;
      gameCanvasContext.fillRect(f.x, f.y, f.s, f.s);
      gameCanvasContext.globalAlpha = 1
    } else if(f.k == 'slash') {
      gameCanvasContext.strokeStyle = f.c?'#ff5':'#fff';
      gameCanvasContext.globalAlpha = f.t / .22;
      gameCanvasContext.lineWidth = f.c?7:4;
      gameCanvasContext.beginPath();
      gameCanvasContext.arc(f.x, f.y, 70, f.a - 1.4, f.a + 1.4);
      gameCanvasContext.stroke();
      gameCanvasContext.globalAlpha = 1
    } else if(f.k == 'spark') {
      gameCanvasContext.fillStyle = '#ff8';
      for(let i = 0; i < 6; i++) {
        const a = i * 1.05;
        gameCanvasContext.fillRect(f.x + Math.cos(a) *(.15 - f.t) * 200, f.y + Math.sin(a) *(.15 - f.t) * 200, 3, 3)
      }
    } else if(f.k == 'ring') {
      gameCanvasContext.strokeStyle = f.c;
      gameCanvasContext.lineWidth = 5;
      gameCanvasContext.globalAlpha = f.t / .4;
      gameCanvasContext.beginPath();
      gameCanvasContext.arc(f.x, f.y, f.r *(1.2 - f.t / .4 * .7), 0, 7);
      gameCanvasContext.stroke();
      gameCanvasContext.globalAlpha = 1
    } else if(f.k == 'bolt') {
      gameCanvasContext.strokeStyle = '#bdf';
      gameCanvasContext.lineWidth = 3;
      gameCanvasContext.beginPath();
      let y = f.y - 300;
      gameCanvasContext.moveTo(f.x, y);
      while(y < f.y) {
        y += 30;
        gameCanvasContext.lineTo(f.x +(randomValue() - .5) * 40, y)
      }
      gameCanvasContext.stroke()
    }
  }
  gameCanvasContext.textAlign = 'center';
  for(const x of floatingTexts) {
    gameCanvasContext.globalAlpha = Math.min(1, x.t * 2);
    gameCanvasContext.font = `bold ${x.z}px Cinzel`;
    gameCanvasContext.fillStyle = x.c;
    gameCanvasContext.strokeStyle = '#000';
    gameCanvasContext.lineWidth = 3;
    gameCanvasContext.strokeText(x.s, x.x, x.y);
    gameCanvasContext.fillText(x.s, x.x, x.y);
    gameCanvasContext.globalAlpha = 1
  }
  gameCanvasContext.restore()
}
function dPl() {
  gameCanvasContext.save();
  gameCanvasContext.translate(player.x, player.y);
  gameCanvasContext.rotate( - 1.4 + Math.min(1, it / 4.5) * 1.4);
  fillCircle(0, 0, 13, '#4a3b30');
  fillCircle(0, - 18, 8, '#d8b99a');
  gameCanvasContext.restore()
}
function dP() {
  const b = Math.sin(t *(player.mv?16:2)) *(player.mv?2.5:1.2),
  fx = Math.cos(player.face),
  fy = Math.sin(player.face);
  gameCanvasContext.save();
  gameCanvasContext.translate(player.x, player.y);
  gameCanvasContext.fillStyle = '#0007';
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse(0, 12, 14, 6, 0, 0, 7);
  gameCanvasContext.fill();
  if(player.dd > 0)gameCanvasContext.globalAlpha = .5;
  if(player.inv > 0 && player.dd <= 0 &&(t * 20|0) % 2)gameCanvasContext.globalAlpha = .4;
  const ph =((t *(player.mv?12:3)|0) % 8) / 8 * piValue * 2,
  lg = player.mv?Math.sin(ph) * 4:0;
  gameCanvasContext.fillStyle = '#2b2b2b';
  gameCanvasContext.fillRect( - 8, 4 + lg, 6, 9);
  gameCanvasContext.fillRect(2, 4 - lg, 6, 9);
  gameCanvasContext.fillStyle = '#d8b99a';
  gameCanvasContext.fillRect( - 14, - 6 + b - lg * .6, 4, 9);
  if(player.at <= 0)gameCanvasContext.fillRect(10, - 6 + b + lg * .6, 4, 9);
  if(player.hf > .3)gameCanvasContext.rotate(.18);
  const sq = player.dd > 0?.7:1;
  gameCanvasContext.scale(1 / sq, sq);
  fillCircle(0, - 4 + b, 12, playerProfile.skinUnlocked?'#8a6a20':getCurrentCharacterClass().color);
  fillCircle(0, - 18 + b, 8, '#d8b99a');
  if(fy > - .5) {
    fillCircle(fx * 4 - 2.5, - 18 + b + fy * 3, 1.6, '#000');
    fillCircle(fx * 4 + 2.5, - 18 + b + fy * 3, 1.6, '#000')
  } else fillCircle(0, - 19 + b, 7, '#2a1a10');
  const sw = player.at > 0?(1 - player.at / .22) * 2.2 - 1.1:.5;
  gameCanvasContext.strokeStyle = '#ccd';
  gameCanvasContext.lineWidth = 4;
  gameCanvasContext.beginPath();
  gameCanvasContext.moveTo(fx * 10, - 4 + fy * 8);
  gameCanvasContext.lineTo(fx * 10 + Math.cos(player.face + sw) * 30, - 4 + fy * 8 + Math.sin(player.face + sw) * 30);
  gameCanvasContext.stroke();
  gameCanvasContext.restore()
}
function dM(m) {
  const T_ = m.t,
  fx = Math.cos(m.face),
  fy = Math.sin(m.face),
  b = Math.sin(t * 6 + m.x) * 2,
  r = m.r;
  gameCanvasContext.save();
  gameCanvasContext.translate(m.x, m.y);
  if(m.st == 'death') {
    gameCanvasContext.globalAlpha = 1 - m.stt / .7;
    gameCanvasContext.rotate(m.stt * 3);
    gameCanvasContext.scale(1 - m.stt * .4, 1 - m.stt * .4)
  }
  gameCanvasContext.fillStyle = '#0007';
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse(0, r * .7, r, r * .4, 0, 0, 7);
  gameCanvasContext.fill();
  if(m.guard) {
    gameCanvasContext.shadowColor = '#ffd700';
    gameCanvasContext.shadowBlur = 18
  }
  const att = m.st == 'attack'?1 + m.stt * .5:1;
  gameCanvasContext.scale(att, att);
  if(m.k == 'sh') {
    gameCanvasContext.globalAlpha *= .9;
    gameCanvasContext.fillStyle = '#10101a';
    gameCanvasContext.beginPath();
    gameCanvasContext.arc(0, - 4, r, piValue, 0);
    for(let i = 0; i < 5; i++)gameCanvasContext.lineTo(r - i * r * .5, r + Math.sin(t * 8 + i) * 4);
    gameCanvasContext.fill()
  } else if(m.k == 'sp') {
    gameCanvasContext.strokeStyle = '#400';
    gameCanvasContext.lineWidth = 2;
    for(let i = 0; i < 8; i++) {
      const s = i < 4? - 1:1,
      k = i % 4;
      gameCanvasContext.beginPath();
      gameCanvasContext.moveTo(0, 0);
      gameCanvasContext.lineTo(s *(r + 6), - 8 + k * 6 + Math.sin(t * 20 + i) * 4);
      gameCanvasContext.stroke()
    }
    fillCircle(0, 0, r, '#7a0a0a');
    fillCircle(0, - 8, 6, '#500')
  } else if(m.k == 'bo') {
    fillCircle(0, 0, r, '#2a2a22');
    gameCanvasContext.fillStyle = '#cbc5b0';
    for(let i = - 2; i < 3; i++)gameCanvasContext.fillRect(i * 6 - 1 + Math.sin(t * 30) * .7, - 8, 3, 18);
    fillCircle(0, - r + 2, 10, '#d8d2bc')
  } else if(m.k == 'gh') {
    gameCanvasContext.globalAlpha *= .65;
    const f = Math.sin(t * 3) * 4;
    gameCanvasContext.fillStyle = '#9bd';
    gameCanvasContext.beginPath();
    gameCanvasContext.arc(0, - 6 + f, r, piValue, 0);
    for(let i = 0; i < 4; i++)gameCanvasContext.lineTo(r - i * r * .7, r + f + Math.sin(t * 6 + i) * 3);
    gameCanvasContext.fill();
    gameCanvasContext.fillStyle = '#c00';
    gameCanvasContext.fillRect( - 5, 2 + f, 2, 10);
    gameCanvasContext.fillRect(3, 2 + f, 2, 10)
  } else {
    fillCircle(0, 0, r, '#3a2a22');
    fillCircle(0, - r + 2, r * .7, '#3a2a22');
    gameCanvasContext.fillStyle = '#3a2a22';
    gameCanvasContext.beginPath();
    gameCanvasContext.moveTo( - 9, - r - 2);
    gameCanvasContext.lineTo( - 5, - r - 12);
    gameCanvasContext.lineTo( - 1, - r);
    gameCanvasContext.moveTo(9, - r - 2);
    gameCanvasContext.lineTo(5, - r - 12);
    gameCanvasContext.lineTo(1, - r);
    gameCanvasContext.fill()
  }
  gameCanvasContext.shadowBlur = 0;
  const ey = m.k == 'sh' || m.k == 'gh' || m.k == 'sp'? - 6:m.k == 'bo'? - r + 2: - r + 2;
  gameCanvasContext.shadowColor = T_.e;
  gameCanvasContext.shadowBlur = 8;
  fillCircle(fx * 3 - 4, ey + fy * 2, 2.4, T_.e);
  fillCircle(fx * 3 + 4, ey + fy * 2, 2.4, T_.e);
  gameCanvasContext.shadowBlur = 0;
  if(m.fl > 0) {
    gameCanvasContext.globalAlpha = .8;
    fillCircle(0, 0, r + 3, '#fff')
  }
  gameCanvasContext.restore();
  if(m.hp < m.mh && m.st != 'death') {
    gameCanvasContext.fillStyle = '#000';
    gameCanvasContext.fillRect(m.x - r, m.y - r - 12, r * 2, 4);
    gameCanvasContext.fillStyle = '#b00';
    gameCanvasContext.fillRect(m.x - r, m.y - r - 12, r * 2 * m.hp / m.mh, 4)
  }
}
function post() {
  const hr =((18 * 60 + gameTime) / 60) % 24,
  ds = gameState == 'intro'?.5:weather == 'eclipse'?.96:gameMode == 'classic'?dk(hr):.55,
  fog = weather == 'fog';
  const L = post.L ||(post.L = document.createElement('canvas'));
  L.width = canvasWidthValue;
  L.height = canvasHeightValue;
  const l = L.getContext('2d');
  l.fillStyle = `rgba(0,0,10,${Math.min(.96,ds+(fog?.1:0))})`;
  l.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
  l.globalCompositeOperation = 'destination-out';
  const px = player.x - camera.x,
  py = player.y - camera.y,
  fr = fog?.55:1;
  let g = l.createRadialGradient(px, py, 5, px, py, 100 * fr);
  g.addColorStop(0, 'rgba(0,0,0,.95)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  l.fillStyle = g;
  l.beginPath();
  l.arc(px, py, 100 * fr, 0, 7);
  l.fill();
  g = l.createRadialGradient(px, py, 10, px, py, 290 * fr);
  g.addColorStop(0, 'rgba(0,0,0,.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  l.fillStyle = g;
  l.beginPath();
  l.moveTo(px, py);
  l.arc(px, py, 290 * fr, player.face - .42, player.face + .42);
  l.fill();
  for(const i of items) {
    if(i.k == 'art' || i.k == 'npc') {
      const x = i.x - camera.x,
      y = i.y - camera.y;
      g = l.createRadialGradient(x, y, 2, x, y, 60);
      g.addColorStop(0, 'rgba(0,0,0,.8)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      l.fillStyle = g;
      l.fillRect(x - 60, y - 60, 120, 120)
    }
  }
  gameCanvasContext.drawImage(L, 0, 0);
  if(weather == 'fog') {
    gameCanvasContext.fillStyle = 'rgba(120,120,130,.12)';
    gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue)
  }
  if(weather == 'rain' || weather == 'storm') {
    gameCanvasContext.strokeStyle = 'rgba(170,190,220,.35)';
    gameCanvasContext.lineWidth = 1;
    gameCanvasContext.beginPath();
    for(let i = 0; i < 110; i++) {
      const x =(i * 97 + t * 300) %(canvasWidthValue + 60) - 30,
      y =(i * 53 + t * 700) % canvasHeightValue;
      gameCanvasContext.moveTo(x, y);
      gameCanvasContext.lineTo(x - 4, y + 14)
    }
    gameCanvasContext.stroke()
  }
  const hp = player.hp / player.mh;
  let v = gameCanvasContext.createRadialGradient(canvasWidthValue / 2, canvasHeightValue / 2, canvasHeightValue * .3, canvasWidthValue / 2, canvasHeightValue / 2, canvasHeightValue * .9);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(${hp<.4?70:0},0,0,${.6+(1-hp)*.3+(player.sn<30?Math.sin(t*5)*.1:0)})`);
  gameCanvasContext.fillStyle = v;
  gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
  if(player.hf > 0) {
    gameCanvasContext.fillStyle = `rgba(150,0,0,${player.hf*.5})`;
    gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue)
  }
  if(screenFlash > 0) {
    gameCanvasContext.fillStyle = `rgba(220,230,255,${screenFlash*.8})`;
    gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue)
  }
  gameCanvasContext.fillStyle = '#fff1';
  for(let i = 0; i < 50; i++)gameCanvasContext.fillRect(randomValue() * canvasWidthValue, randomValue() * canvasHeightValue, 2, 2)
}
function hud() {
  const bar =(y, v, c, l) => {
    gameCanvasContext.fillStyle = '#000a';
    gameCanvasContext.fillRect(12, y, 170, 14);
    gameCanvasContext.fillStyle = c;
    gameCanvasContext.fillRect(13, y + 1, 168 * clampValue(v, 0, 1), 12);
    gameCanvasContext.strokeStyle = '#8b0000';
    gameCanvasContext.lineWidth = 2;
    gameCanvasContext.strokeRect(12, y, 170, 14);
    gameCanvasContext.fillStyle = '#fff';
    gameCanvasContext.font = '10px Cinzel';
    gameCanvasContext.textAlign = 'left';
    gameCanvasContext.fillText(l, 190, y + 11)
  };
  bar(12, player.hp / player.mh, `hsl(0,80%,${30+Math.sin(t*8)*(player.hp<30?8:0)}%)`, '♥ HP');
  bar(32, player.st / 100, '#c9a227', '⚡ STAMINA');
  bar(52, player.sn / 100, '#3a5a9a', '👁 SANITY');
  gameCanvasContext.fillStyle = '#ffd700';
  gameCanvasContext.font = '13px Cinzel';
  gameCanvasContext.textAlign = 'left';
  gameCanvasContext.fillText(`Medkit ${player.meds}   Nyawa ${'♥'.repeat(Math.max(0,player.lives))}`, 12, 84);
  hud2();
  gameCanvasContext.textAlign = 'center';
  gameCanvasContext.font = '16px Cinzel';
  if(gameMode == 'classic') {
    const hr =((18 * 60 + gameTime) / 60) % 24,
    hh = hr|0,
    mm =(hr % 1 * 60)|0;
    gameCanvasContext.fillText(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} → 06:00   ·   Malam ${night}   ·   Artefak ${player.art}/5   ·   Gelombang ${waveNumber}`, canvasWidthValue / 2, 22);
    gameCanvasContext.font = '12px Cinzel';
    gameCanvasContext.fillStyle = '#caa';
    gameCanvasContext.fillText(`${zones[zoneAt(player.x,player.y)][0]}  ·  ${{clear:'Cerah',rain:'Hujan',fog:'Kabut',storm:'Badai',eclipse:'Gerhana'}[weather]}  ·  Penyintas ${player.rs}/3  ·  Catatan ${player.nt}/10`, canvasWidthValue / 2, 40)
  } else {
    gameCanvasContext.fillText(`Langkah ${Math.min(trainingStep+1,6)}/6`, canvasWidthValue / 2, 22);
    gameCanvasContext.font = '14px Cinzel';
    gameCanvasContext.fillStyle = '#fff';
    gameCanvasContext.fillText(TS[Math.min(trainingStep, 5)], canvasWidthValue / 2, 44)
  }
  /* minimap perkamen */
  const mx = canvasWidthValue - 136,
  my = 56,
  sx = 124 / worldWidthValue,
  sy = 84 / worldHeightValue;
  gameCanvasContext.fillStyle = '#d8c39acc';
  gameCanvasContext.fillRect(mx - 4, my - 4, 132, 92);
  gameCanvasContext.strokeStyle = '#5a3a1a';
  gameCanvasContext.strokeRect(mx - 4, my - 4, 132, 92);
  gameCanvasContext.fillStyle = '#5a3a1a55';
  zones.forEach(z => gameCanvasContext.strokeRect(mx + z[1] * sx, my + z[2] * sy, z[3] * sx, z[4] * sy));
  items.forEach(i => {
    if(i.k == 'art') {
      gameCanvasContext.fillStyle = '#b8860b'; gameCanvasContext.fillRect(mx + i.x * sx - 2, my + i.y * sy - 2, 4, 4)
    }
  });
  fillCircle(mx + player.x * sx, my + player.y * sy, 3, '#c00');
  gameCanvasContext.fillStyle = '#300';
  gameCanvasContext.font = '9px Cinzel';
  gameCanvasContext.fillText('N', mx + 62, my + 8);
  if(msg) {
    gameCanvasContext.fillStyle = '#000c';
    gameCanvasContext.fillRect(canvasWidthValue / 2 - 300, canvasHeightValue - 70, 600, 34);
    gameCanvasContext.strokeStyle = '#8b0000';
    gameCanvasContext.strokeRect(canvasWidthValue / 2 - 300, canvasHeightValue - 70, 600, 34);
    gameCanvasContext.fillStyle = '#ffd700';
    gameCanvasContext.font = '14px Cinzel';
    gameCanvasContext.textAlign = 'center';
    gameCanvasContext.fillText(msg.s, canvasWidthValue / 2, canvasHeightValue - 48)
  }
  if(gameMode == 'train') {
    const tg = trainingStep == 2?runtimeState.d:trainingStep == 4?runtimeState.m:trainingStep == 5?runtimeState.a:null;
    if(tg) {
      const a = Math.atan2(tg.y - player.y, tg.x - player.x),
      d = distanceBetween(tg, player);
      let ax = tg.x - camera.x,
      ay = tg.y - camera.y - 40;
      if(d > 200 || ax < 0 || ax > canvasWidthValue || ay < 0 || ay > canvasHeightValue) {
        ax = clampValue(canvasWidthValue / 2 + Math.cos(a) * 200, 30, canvasWidthValue - 30);
        ay = clampValue(canvasHeightValue / 2 + Math.sin(a) * 130, 30, canvasHeightValue - 30)
      }
      gameCanvasContext.save();
      gameCanvasContext.translate(ax, ay + Math.sin(t * 6) * 4);
      gameCanvasContext.rotate(d > 200?a:piValue / 2);
      gameCanvasContext.fillStyle = '#ff0';
      gameCanvasContext.beginPath();
      gameCanvasContext.moveTo(14, 0);
      gameCanvasContext.lineTo( - 8, - 10);
      gameCanvasContext.lineTo( - 8, 10);
      gameCanvasContext.fill();
      gameCanvasContext.restore()
    }
  }
}
function face() {
  gameCanvasContext.save();
  gameCanvasContext.fillStyle = '#000';
  gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
  const z = 1 +(1 - sc.t / .55) * .6;
  gameCanvasContext.translate(canvasWidthValue / 2, canvasHeightValue / 2);
  gameCanvasContext.scale(z, z);
  gameCanvasContext.translate((randomValue() - .5) * 14, (randomValue() - .5) * 14);
  gameCanvasContext.fillStyle = '#1a0000';
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse(0, 0, 170, 210, 0, 0, 7);
  gameCanvasContext.fill();
  gameCanvasContext.fillStyle = '#f00';
  gameCanvasContext.shadowColor = '#f00';
  gameCanvasContext.shadowBlur = 30;
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse( - 60, - 50, 26, 14, .3, 0, 7);
  gameCanvasContext.ellipse(60, - 50, 26, 14, - .3, 0, 7);
  gameCanvasContext.fill();
  gameCanvasContext.shadowBlur = 0;
  gameCanvasContext.fillStyle = '#000';
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse(0, 80, 100, 70, 0, 0, 7);
  gameCanvasContext.fill();
  gameCanvasContext.fillStyle = '#eee';
  for(let i = - 4; i < 5; i++) {
    gameCanvasContext.beginPath();
    gameCanvasContext.moveTo(i * 20 - 8, 30);
    gameCanvasContext.lineTo(i * 20, 70 +(i % 2?10:0));
    gameCanvasContext.lineTo(i * 20 + 8, 30);
    gameCanvasContext.fill()
  }
  gameCanvasContext.restore();
  gameCanvasContext.fillStyle = `rgba(180,0,0,${.4*sc.t})`;
  gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue)
}
