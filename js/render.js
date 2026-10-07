/* ===== RENDER ===== */
function drawWorld() {
  const sx = (random() -.5) * screenShake,
  sy = (random() -.5) * screenShake;
  context.save();
  context.translate(- camera.x + sx | 0,
  - camera.y + sy | 0);
  if (isInsideInterior)drawRoom();
  else ZONES.forEach(z => {
    context.fillStyle = z[5]; context.fillRect(z[1],
    z[2],
    z[3],
    z[4]); context.strokeStyle = '#0006'; context.strokeRect(z[1],
    z[2],
    z[3],
    z[4])
  });
  for (const d of isInsideInterior ? []: groundDetails) {
    if (d.x < camera.x - 10 || d.x > camera.x + canvasWidth + 10 || d.y < camera.y - 10 || d.y > camera.y + canvasHeight + 10)continue;
    const z = zoneAt(d.x,
    d.y);
    context.fillStyle = d.c <.1 && z != 3 ? '#6a0808': d.c <.2 ? ZONES[z][6]: '#0004';
    context.fillRect(d.x,
    d.y,
    d.s,
    d.s * (z == 2 ? 3: 1))
  }
  const lt = ZONES[3];
  context.fillStyle = '#000';
  for (const o of isInsideInterior ? []: obstacles) {
    if (o.x > camera.x + canvasWidth || o.x + o.w < camera.x || o.y > camera.y + canvasHeight || o.y + o.h < camera.y)continue;
    if (o.lake) {
      context.fillStyle = '#5a0a12';
      context.fillRect(o.x,
      o.y,
      o.w,
      o.h);
      context.fillStyle = '#8b1a22';
      for (let i = 0; i < 5; i++)context.fillRect(o.x + 20 + i * 55,
      o.y + 30 + Math.sin(elapsedTime * 2 + i) * 8 + i * 30,
      40,
      3);
      continue
    }
    if (o.z == 2) {
      ci(o.x + 12,
      o.y + 12,
      14,
      '#1a120a');
      context.strokeStyle = '#2a1c10';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(o.x + 12,
      o.y + 12);
      context.lineTo(o.x + 30,
      o.y - 20);
      context.moveTo(o.x + 12,
      o.y + 12);
      context.lineTo(o.x - 6,
      o.y - 14);
      context.stroke();
      continue
    }
    if (o.z == 5) {
      context.fillStyle = '#4a5258';
      context.fillRect(o.x,
      o.y,
      o.w,
      o.h);
      context.fillStyle = '#2a3036';
      context.fillRect(o.x + 4,
      o.y + 4,
      o.w - 8,
      6);
      continue
    }
    const c = ZONES[o.z][6];
    context.fillStyle = o.tower ? '#2a1a2e': c;
    context.fillRect(o.x,
    o.y,
    o.w,
    o.h);
    context.fillStyle = '#000a';
    context.fillRect(o.x,
    o.y + o.h - 12,
    o.w,
    12);
    context.fillStyle = '#000';
    context.fillRect(o.x + o.w / 2 - 8,
    o.y + o.h - 26,
    16,
    26);
    context.fillStyle = '#0008';
    context.fillRect(o.x - 6,
    o.y - 10,
    o.w + 12,
    14);
    if (o.z != 4) {
      context.fillStyle = (elapsedTime * 3 | 0) % 7 ? '#ffb30055': '#0000';
      context.fillRect(o.x + 10,
      o.y + 16,
      12,
      12)
    }
    if (o.z == 4) {
      context.fillStyle = '#bbb';
      context.fillRect(o.x + o.w / 2 - 2,
      o.y - 40,
      4,
      30);
      context.fillRect(o.x + o.w / 2 - 9,
      o.y - 26,
      18,
      4)
    }
  }
  for (const n of monsterNests)drawNest(n);
  for (const i of items) {
    const p = Math.sin(elapsedTime * 4) * 3;
    context.shadowColor = i.k == 'art' ? '#ffd700': i.k == 'med' ? '#f44': '#8cf';
    context.shadowBlur = 14;
    if (i.k == 'med') {
      context.fillStyle = '#eee';
      context.fillRect(i.x - 8,
      i.y - 6 + p,
      16,
      12);
      context.fillStyle = '#d00';
      context.fillRect(i.x - 2,
      i.y - 5 + p,
      4,
      10);
      context.fillRect(i.x - 7,
      i.y - 1 + p,
      14,
      3)
    } else if (i.k == 'art') {
      context.fillStyle = '#ffd700';
      context.beginPath();
      context.moveTo(i.x,
      i.y - 14 + p);
      context.lineTo(i.x + 9,
      i.y + p);
      context.lineTo(i.x,
      i.y + 14 + p);
      context.lineTo(i.x - 9,
      i.y + p);
      context.fill()
    } else if (i.k == 'cd') {
      context.fillStyle = '#ddd';
      context.fillRect(i.x - 4,
      i.y - 4,
      8,
      18);
      ci(i.x,
      i.y - 8,
      i.lit ? 7: 3,
      i.lit ? '#fc3': '#555');
      context.fillStyle = '#fff';
      context.font = '12px Cinzel';
      context.textAlign = 'center';
      context.fillText(i.n,
      i.x,
      i.y + 28)
    } else if (i.k == 'chest') {
      context.fillStyle = roomState.open ? '#c9a227': '#5a3a1a';
      context.fillRect(i.x - 16,
      i.y - 10,
      32,
      22);
      context.fillStyle = '#000';
      context.fillRect(i.x - 3,
      i.y - 2,
      6,
      8)
    } else if (i.k == 'note') {
      context.fillStyle = '#d8c39a';
      context.fillRect(i.x - 7,
      i.y - 9 + p,
      14,
      18)
    } else {
      ci(i.x,
      i.y - 8,
      8,
      '#9c8');
      context.fillStyle = '#456';
      context.fillRect(i.x - 8,
      i.y,
      16,
      16)
    }
    context.shadowBlur = 0
  }
  const E = [...monsters.map(m => ({
    y: m.y,
    m
  })),
  {
    y: player.y,
    p: 1
  }].sort((a,
  b) => a.y - b.y);
  for (const e of E) {
    if (e.p) {
      if (gameState != 'intro' || introProgress > 4.5 || runtimeState.ctl)dP();
      else dPl()
    } else dM(e.m)
  }
  for (const p of projectiles) {
    context.shadowColor = '#f00';
    context.shadowBlur = 10;
    ci(p.x,
    p.y,
    p.f ? 3: 6,
    p.f ? '#8f8': '#c00');
    context.shadowBlur = 0
  }
  for (const f of effects) {
    if (f.k == 'p') {
      context.globalAlpha = Math.min(1,
      f.elapsedTime * 2);
      context.fillStyle = f.c;
      context.fillRect(f.x,
      f.y,
      f.s,
      f.s);
      context.globalAlpha = 1
    } else if (f.k == 'slash') {
      context.strokeStyle = f.c ? '#ff5': '#fff';
      context.globalAlpha = f.elapsedTime /.22;
      context.lineWidth = f.c ? 7: 4;
      context.beginPath();
      context.arc(f.x,
      f.y,
      70,
      f.a - 1.4,
      f.a + 1.4);
      context.stroke();
      context.globalAlpha = 1
    } else if (f.k == 'spark') {
      context.fillStyle = '#ff8';
      for (let i = 0; i < 6; i++) {
        const a = i * 1.05;
        context.fillRect(f.x + Math.cos(a) * (.15 - f.elapsedTime) * 200,
        f.y + Math.sin(a) * (.15 - f.elapsedTime) * 200,
        3,
        3)
      }
    } else if (f.k == 'ring') {
      context.strokeStyle = f.c;
      context.lineWidth = 5;
      context.globalAlpha = f.elapsedTime /.4;
      context.beginPath();
      context.arc(f.x,
      f.y,
      f.r * (1.2 - f.elapsedTime /.4 *.7),
      0,
      7);
      context.stroke();
      context.globalAlpha = 1
    } else if (f.k == 'bolt') {
      context.strokeStyle = '#bdf';
      context.lineWidth = 3;
      context.beginPath();
      let y = f.y - 300;
      context.moveTo(f.x,
      y);
      while (y < f.y) {
        y += 30;
        context.lineTo(f.x + (random() -.5) * 40,
        y)
      }
      context.stroke()
    }
  }
  context.textAlign = 'center';
  for (const x of floatingTexts) {
    context.globalAlpha = Math.min(1,
    x.elapsedTime * 2);
    context.font = `bold ${x.z}px Cinzel`;
    context.fillStyle = x.c;
    context.strokeStyle = '#000';
    context.lineWidth = 3;
    context.strokeText(x.s,
    x.x,
    x.y);
    context.fillText(x.s,
    x.x,
    x.y);
    context.globalAlpha = 1
  }
  context.restore()
}
function dPl() {
  context.save();
  context.translate(player.x,
  player.y);
  context.rotate(- 1.4 + Math.min(1,
  introProgress / 4.5) * 1.4);
  ci(0,
  0,
  13,
  '#4a3b30');
  ci(0,
  - 18,
  8,
  '#d8b99a');
  context.restore()
}
function dP() {
  const b = Math.sin(elapsedTime * (player.mv ? 16: 2)) * (player.mv ? 2.5: 1.2),
  fx = Math.cos(player.face),
  fy = Math.sin(player.face);
  context.save();
  context.translate(player.x,
  player.y);
  context.fillStyle = '#0007';
  context.beginPath();
  context.ellipse(0,
  12,
  14,
  6,
  0,
  0,
  7);
  context.fill();
  if (player.dd > 0)context.globalAlpha =.5;
  if (player.inv > 0 && player.dd <= 0 && (elapsedTime * 20 | 0) % 2)context.globalAlpha =.4;
  const ph = ((elapsedTime * (player.mv ? 12: 3) | 0) % 8) / 8 * PI * 2,
  lg = player.mv ? Math.sin(ph) * 4: 0;
  context.fillStyle = '#2b2b2b';
  context.fillRect(- 8,
  4 + lg,
  6,
  9);
  context.fillRect(2,
  4 - lg,
  6,
  9);
  context.fillStyle = '#d8b99a';
  context.fillRect(- 14,
  - 6 + b - lg *.6,
  4,
  9);
  if (player.at <= 0)context.fillRect(10,
  - 6 + b + lg *.6,
  4,
  9);
  if (player.hf >.3)context.rotate(.18);
  const sq = player.dd > 0 ?.7: 1;
  context.scale(1 / sq,
  sq);
  ci(0,
  - 4 + b,
  12,
  playerProfile.skinUnlocked ? '#8a6a20': getCurrentCharacterClass().color);
  ci(0,
  - 18 + b,
  8,
  '#d8b99a');
  if (fy >-.5) {
    ci(fx * 4 - 2.5,
    - 18 + b + fy * 3,
    1.6,
    '#000');
    ci(fx * 4 + 2.5,
    - 18 + b + fy * 3,
    1.6,
    '#000')
  } else ci(0,
  - 19 + b,
  7,
  '#2a1a10');
  const sw = player.at > 0 ? (1 - player.at /.22) * 2.2 - 1.1:.5;
  context.strokeStyle = '#ccd';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(fx * 10,
  - 4 + fy * 8);
  context.lineTo(fx * 10 + Math.cos(player.face + sw) * 30,
  - 4 + fy * 8 + Math.sin(player.face + sw) * 30);
  context.stroke();
  context.restore()
}
function dM(m) {
  const T_ = m.elapsedTime,
  fx = Math.cos(m.face),
  fy = Math.sin(m.face),
  b = Math.sin(elapsedTime * 6 + m.x) * 2,
  r = m.r;
  context.save();
  context.translate(m.x,
  m.y);
  if (m.st == 'death') {
    context.globalAlpha = 1 - m.stt /.7;
    context.rotate(m.stt * 3);
    context.scale(1 - m.stt *.4,
    1 - m.stt *.4)
  }
  context.fillStyle = '#0007';
  context.beginPath();
  context.ellipse(0,
  r *.7,
  r,
  r *.4,
  0,
  0,
  7);
  context.fill();
  if (m.guard) {
    context.shadowColor = '#ffd700';
    context.shadowBlur = 18
  }
  const att = m.st == 'attack' ? 1 + m.stt *.5: 1;
  context.scale(att,
  att);
  if (m.k == 'sh') {
    context.globalAlpha *=.9;
    context.fillStyle = '#10101a';
    context.beginPath();
    context.arc(0,
    - 4,
    r,
    PI,
    0);
    for (let i = 0; i < 5; i++)context.lineTo(r - i * r *.5,
    r + Math.sin(elapsedTime * 8 + i) * 4);
    context.fill()
  } else if (m.k == 'sp') {
    context.strokeStyle = '#400';
    context.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const s = i < 4 ?- 1: 1,
      k = i % 4;
      context.beginPath();
      context.moveTo(0,
      0);
      context.lineTo(s * (r + 6),
      - 8 + k * 6 + Math.sin(elapsedTime * 20 + i) * 4);
      context.stroke()
    }
    ci(0,
    0,
    r,
    '#7a0a0a');
    ci(0,
    - 8,
    6,
    '#500')
  } else if (m.k == 'bo') {
    ci(0,
    0,
    r,
    '#2a2a22');
    context.fillStyle = '#cbc5b0';
    for (let i =- 2; i < 3; i++)context.fillRect(i * 6 - 1 + Math.sin(elapsedTime * 30) *.7,
    - 8,
    3,
    18);
    ci(0,
    - r + 2,
    10,
    '#d8d2bc')
  } else if (m.k == 'gh') {
    context.globalAlpha *=.65;
    const f = Math.sin(elapsedTime * 3) * 4;
    context.fillStyle = '#9bd';
    context.beginPath();
    context.arc(0,
    - 6 + f,
    r,
    PI,
    0);
    for (let i = 0; i < 4; i++)context.lineTo(r - i * r *.7,
    r + f + Math.sin(elapsedTime * 6 + i) * 3);
    context.fill();
    context.fillStyle = '#c00';
    context.fillRect(- 5,
    2 + f,
    2,
    10);
    context.fillRect(3,
    2 + f,
    2,
    10)
  } else {
    ci(0,
    0,
    r,
    '#3a2a22');
    ci(0,
    - r + 2,
    r *.7,
    '#3a2a22');
    context.fillStyle = '#3a2a22';
    context.beginPath();
    context.moveTo(- 9,
    - r - 2);
    context.lineTo(- 5,
    - r - 12);
    context.lineTo(- 1,
    - r);
    context.moveTo(9,
    - r - 2);
    context.lineTo(5,
    - r - 12);
    context.lineTo(1,
    - r);
    context.fill()
  }
  context.shadowBlur = 0;
  const ey = m.k == 'sh' || m.k == 'gh' || m.k == 'sp' ?- 6: m.k == 'bo' ?- r + 2: - r + 2;
  context.shadowColor = T_.e;
  context.shadowBlur = 8;
  ci(fx * 3 - 4,
  ey + fy * 2,
  2.4,
  T_.e);
  ci(fx * 3 + 4,
  ey + fy * 2,
  2.4,
  T_.e);
  context.shadowBlur = 0;
  if (m.fl > 0) {
    context.globalAlpha =.8;
    ci(0,
    0,
    r + 3,
    '#fff')
  }
  context.restore();
  if (m.hp < m.mh && m.st != 'death') {
    context.fillStyle = '#000';
    context.fillRect(m.x - r,
    m.y - r - 12,
    r * 2,
    4);
    context.fillStyle = '#b00';
    context.fillRect(m.x - r,
    m.y - r - 12,
    r * 2 * m.hp / m.mh,
    4)
  }
}
function post() {
  const hr = ((18 * 60 + gameTime) / 60) % 24,
  ds = gameState == 'intro' ?.5: weather == 'eclipse' ?.96: MODE == 'classic' ? dk(hr):.55,
  fog = weather == 'fog';
  const L = post.L || (post.L = document.createElement('canvas'));
  L.width = canvasWidth;
  L.height = canvasHeight;
  const l = L.getContext('2d');
  l.fillStyle = `rgba(0,0,10,${Math.min(.96,ds+(fog?.1:0))})`;
  l.fillRect(0,
  0,
  canvasWidth,
  canvasHeight);
  l.globalCompositeOperation = 'destination-out';
  const px = player.x - camera.x,
  py = player.y - camera.y,
  fr = fog ?.55: 1;
  let g = l.createRadialGradient(px,
  py,
  5,
  px,
  py,
  100 * fr);
  g.addColorStop(0,
  'rgba(0,0,0,.95)');
  g.addColorStop(1,
  'rgba(0,0,0,0)');
  l.fillStyle = g;
  l.beginPath();
  l.arc(px,
  py,
  100 * fr,
  0,
  7);
  l.fill();
  g = l.createRadialGradient(px,
  py,
  10,
  px,
  py,
  290 * fr);
  g.addColorStop(0,
  'rgba(0,0,0,.9)');
  g.addColorStop(1,
  'rgba(0,0,0,0)');
  l.fillStyle = g;
  l.beginPath();
  l.moveTo(px,
  py);
  l.arc(px,
  py,
  290 * fr,
  player.face -.42,
  player.face +.42);
  l.fill();
  for (const i of items) {
    if (i.k == 'art' || i.k == 'npc') {
      const x = i.x - camera.x,
      y = i.y - camera.y;
      g = l.createRadialGradient(x,
      y,
      2,
      x,
      y,
      60);
      g.addColorStop(0,
      'rgba(0,0,0,.8)');
      g.addColorStop(1,
      'rgba(0,0,0,0)');
      l.fillStyle = g;
      l.fillRect(x - 60,
      y - 60,
      120,
      120)
    }
  }
  context.drawImage(L,
  0,
  0);
  if (weather == 'fog') {
    context.fillStyle = 'rgba(120,120,130,.12)';
    context.fillRect(0,
    0,
    canvasWidth,
    canvasHeight)
  }
  if (weather == 'rain' || weather == 'storm') {
    context.strokeStyle = 'rgba(170,190,220,.35)';
    context.lineWidth = 1;
    context.beginPath();
    for (let i = 0; i < 110; i++) {
      const x = (i * 97 + elapsedTime * 300) % (canvasWidth + 60) - 30,
      y = (i * 53 + elapsedTime * 700) % canvasHeight;
      context.moveTo(x,
      y);
      context.lineTo(x - 4,
      y + 14)
    }
    context.stroke()
  }
  const hp = player.hp / player.mh;
  let v = context.createRadialGradient(canvasWidth / 2,
  canvasHeight / 2,
  canvasHeight *.3,
  canvasWidth / 2,
  canvasHeight / 2,
  canvasHeight *.9);
  v.addColorStop(0,
  'rgba(0,0,0,0)');
  v.addColorStop(1,
  `rgba(${hp<.4?70:0},0,0,${.6+(1-hp)*.3+(player.sn<30?Math.sin(elapsedTime*5)*.1:0)})`);
  context.fillStyle = v;
  context.fillRect(0,
  0,
  canvasWidth,
  canvasHeight);
  if (player.hf > 0) {
    context.fillStyle = `rgba(150,0,0,${player.hf*.5})`;
    context.fillRect(0,
    0,
    canvasWidth,
    canvasHeight)
  }
  if (screenFlash > 0) {
    context.fillStyle = `rgba(220,230,255,${screenFlash*.8})`;
    context.fillRect(0,
    0,
    canvasWidth,
    canvasHeight)
  }
  context.fillStyle = '#fff1';
  for (let i = 0; i < 50; i++)context.fillRect(random() * canvasWidth,
  random() * canvasHeight,
  2,
  2)
}
function hud() {
  const bar = (y,
  v,
  c,
  l) => {
    context.fillStyle = '#000a';
    context.fillRect(12,
    y,
    170,
    14);
    context.fillStyle = c;
    context.fillRect(13,
    y + 1,
    168 * clamp(v,
    0,
    1),
    12);
    context.strokeStyle = '#8b0000';
    context.lineWidth = 2;
    context.strokeRect(12,
    y,
    170,
    14);
    context.fillStyle = '#fff';
    context.font = '10px Cinzel';
    context.textAlign = 'left';
    context.fillText(l,
    190,
    y + 11)
  };
  bar(12,
  player.hp / player.mh,
  `hsl(0,80%,${30+Math.sin(elapsedTime*8)*(player.hp<30?8:0)}%)`,
  '♥ HP');
  bar(32,
  player.st / 100,
  '#c9a227',
  '⚡ STAMINA');
  bar(52,
  player.sn / 100,
  '#3a5a9a',
  '👁 SANITY');
  context.fillStyle = '#ffd700';
  context.font = '13px Cinzel';
  context.textAlign = 'left';
  context.fillText(`Medkit ${player.meds}   Nyawa ${'♥'.repeat(Math.max(0,player.lives))}`,
  12,
  84);
  hud2();
  context.textAlign = 'center';
  context.font = '16px Cinzel';
  if (MODE == 'classic') {
    const hr = ((18 * 60 + gameTime) / 60) % 24,
    hh = hr | 0,
    mm = (hr % 1 * 60) | 0;
    context.fillText(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} → 06:00   ·   Malam ${night}   ·   Artefak ${player.art}/5   ·   Gelombang ${currentWave}`,
    canvasWidth / 2,
    22);
    context.font = '12px Cinzel';
    context.fillStyle = '#caa';
    context.fillText(`${ZONES[zoneAt(player.x,player.y)][0]}  ·  ${{clear:'Cerah',rain:'Hujan',fog:'Kabut',storm:'Badai',eclipse:'Gerhana'}[weather]}  ·  Penyintas ${player.rs}/3  ·  Catatan ${player.nt}/10`,
    canvasWidth / 2,
    40)
  } else {
    context.fillText(`Langkah ${Math.min(trainingStep+1,6)}/6`,
    canvasWidth / 2,
    22);
    context.font = '14px Cinzel';
    context.fillStyle = '#fff';
    context.fillText(TRAINING_STEPS[Math.min(trainingStep,
    5)],
    canvasWidth / 2,
    44)
  }
  /* minimap perkamen */
  const mx = canvasWidth - 136,
  my = 56,
  sx = 124 / worldWidth,
  sy = 84 / worldHeight;
  context.fillStyle = '#d8c39acc';
  context.fillRect(mx - 4,
  my - 4,
  132,
  92);
  context.strokeStyle = '#5a3a1a';
  context.strokeRect(mx - 4,
  my - 4,
  132,
  92);
  context.fillStyle = '#5a3a1a55';
  ZONES.forEach(z => context.strokeRect(mx + z[1] * sx,
  my + z[2] * sy,
  z[3] * sx,
  z[4] * sy));
  items.forEach(i => {
    if (i.k == 'art') {
      context.fillStyle = '#b8860b'; context.fillRect(mx + i.x * sx - 2,
      my + i.y * sy - 2,
      4,
      4)
    }
  });
  ci(mx + player.x * sx,
  my + player.y * sy,
  3,
  '#c00');
  context.fillStyle = '#300';
  context.font = '9px Cinzel';
  context.fillText('N',
  mx + 62,
  my + 8);
  if (statusMessage) {
    context.fillStyle = '#000c';
    context.fillRect(canvasWidth / 2 - 300,
    canvasHeight - 70,
    600,
    34);
    context.strokeStyle = '#8b0000';
    context.strokeRect(canvasWidth / 2 - 300,
    canvasHeight - 70,
    600,
    34);
    context.fillStyle = '#ffd700';
    context.font = '14px Cinzel';
    context.textAlign = 'center';
    context.fillText(statusMessage.s,
    canvasWidth / 2,
    canvasHeight - 48)
  }
  if (MODE == 'train') {
    const tg = trainingStep == 2 ? runtimeState.d: trainingStep == 4 ? runtimeState.m: trainingStep == 5 ? runtimeState.a: null;
    if (tg) {
      const a = Math.atan2(tg.y - player.y,
      tg.x - player.x),
      d = dist(tg,
      player);
      let ax = tg.x - camera.x,
      ay = tg.y - camera.y - 40;
      if (d > 200 || ax < 0 || ax > canvasWidth || ay < 0 || ay > canvasHeight) {
        ax = clamp(canvasWidth / 2 + Math.cos(a) * 200,
        30,
        canvasWidth - 30);
        ay = clamp(canvasHeight / 2 + Math.sin(a) * 130,
        30,
        canvasHeight - 30)
      }
      context.save();
      context.translate(ax,
      ay + Math.sin(elapsedTime * 6) * 4);
      context.rotate(d > 200 ? a: PI / 2);
      context.fillStyle = '#ff0';
      context.beginPath();
      context.moveTo(14,
      0);
      context.lineTo(- 8,
      - 10);
      context.lineTo(- 8,
      10);
      context.fill();
      context.restore()
    }
  }
}
function face() {
  context.save();
  context.fillStyle = '#000';
  context.fillRect(0,
  0,
  canvasWidth,
  canvasHeight);
  const z = 1 + (1 - scareEffect.elapsedTime /.55) *.6;
  context.translate(canvasWidth / 2,
  canvasHeight / 2);
  context.scale(z,
  z);
  context.translate((random() -.5) * 14,
  (random() -.5) * 14);
  context.fillStyle = '#1a0000';
  context.beginPath();
  context.ellipse(0,
  0,
  170,
  210,
  0,
  0,
  7);
  context.fill();
  context.fillStyle = '#f00';
  context.shadowColor = '#f00';
  context.shadowBlur = 30;
  context.beginPath();
  context.ellipse(- 60,
  - 50,
  26,
  14,
  .3,
  0,
  7);
  context.ellipse(60,
  - 50,
  26,
  14,
  -.3,
  0,
  7);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = '#000';
  context.beginPath();
  context.ellipse(0,
  80,
  100,
  70,
  0,
  0,
  7);
  context.fill();
  context.fillStyle = '#eee';
  for (let i =- 4; i < 5; i++) {
    context.beginPath();
    context.moveTo(i * 20 - 8,
    30);
    context.lineTo(i * 20,
    70 + (i % 2 ? 10: 0));
    context.lineTo(i * 20 + 8,
    30);
    context.fill()
  }
  context.restore();
  context.fillStyle = `rgba(180,0,0,${.4*scareEffect.elapsedTime})`;
  context.fillRect(0,
  0,
  canvasWidth,
  canvasHeight)
}
