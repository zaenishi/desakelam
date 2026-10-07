/* ===== MENU & INTRO ===== */
function menuScene() {
  const g = context.createLinearGradient(0,
  0,
  0,
  canvasHeight);
  g.addColorStop(0,
  '#1a0000');
  g.addColorStop(1,
  '#0a0a0a');
  context.fillStyle = g;
  context.fillRect(0,
  0,
  canvasWidth,
  canvasHeight);
  for (let i = 0; i < 40; i++) {
    context.fillStyle = '#fff6';
    context.fillRect((i * 137) % canvasWidth,
    (i * 71) % 250,
    1.5,
    1.5)
  }
  ci(720,
  110,
  44,
  '#8b0000');
  ci(720,
  110,
  52,
  '#8b000030');
  [['#120808',
  .2,
  330],
  ['#0d0505',
  .5,
  400],
  ['#070303',
  1,
  460]].forEach(([c,
  sp,
  y],
  k) => {
    context.fillStyle = c; context.beginPath(); context.moveTo(0,
    canvasHeight); for (let x = 0; x <= canvasWidth; x += 20)context.lineTo(x,
    y - Math.sin((x + elapsedTime * 20 * sp) *.015 * (k + 1)) * 30 - k * 10); context.lineTo(canvasWidth,
    canvasHeight); context.fill()
  });
  context.fillStyle = 'rgba(160,150,170,.07)';
  for (let i = 0; i < 4; i++)context.fillRect(((elapsedTime * 15 * (i + 1)) % (canvasWidth + 400)) - 300,
  300 + i * 40,
  400,
  40);
  if (weather == 'rain') {
    context.strokeStyle = '#8ab5';
    context.beginPath();
    for (let i = 0; i < 90; i++) {
      const x = (i * 91 + elapsedTime * 200) % canvasWidth,
      y = (i * 47 + elapsedTime * 600) % canvasHeight;
      context.moveTo(x,
      y);
      context.lineTo(x - 3,
      y + 12)
    }
    context.stroke()
  }
  for (const f of fireflies) {
    f.x += Math.sin(elapsedTime + f.p) *.4;
    f.y += Math.cos(elapsedTime *.7 + f.p) *.3;
    ci(f.x,
    f.y,
    2,
    `rgba(255,220,80,${.5+Math.sin(elapsedTime*3+f.p)*.5})`)
  }
  context.save();
  context.translate(200,
  430);
  const b = Math.sin(elapsedTime * 2) * 2;
  context.fillStyle = '#000';
  context.beginPath();
  context.ellipse(0,
  40,
  30,
  8,
  0,
  0,
  7);
  context.fill();
  context.fillStyle = '#2b2b2b';
  context.fillRect(- 10,
  20,
  8,
  20);
  context.fillRect(3,
  20,
  8,
  20);
  ci(0,
  0 + b,
  18,
  '#4a3b30');
  ci(0,
  - 26 + b,
  11,
  '#d8b99a');
  if ((elapsedTime % 4) >.15) {
    ci(3,
    - 26 + b,
    2,
    '#000');
    ci(9,
    - 26 + b,
    2,
    '#000')
  }
  context.restore()
}
function introScene() {
  const k = introProgress;
  let s;
  context.fillStyle = '#000';
  if (k < 3) {
    context.save();
    context.globalAlpha = Math.min(1,
    k / 1.5);
    context.fillStyle = '#b30000';
    context.font = '46px Creepster';
    context.textAlign = 'center';
    context.fillText('MALAM KELAM',
    canvasWidth / 2,
    canvasHeight / 2 - 10);
    context.fillText('DI DESA TERKUTUK',
    canvasWidth / 2,
    canvasHeight / 2 + 40);
    context.fillStyle = '#8b0000';
    for (let i = 0; i < 9; i++) {
      const x = canvasWidth / 2 - 200 + i * 50,
      l = Math.min(1,
      k / 3) * (20 + (i * 37 % 40));
      context.fillRect(x,
      canvasHeight / 2 + 48,
      3,
      l);
      ci(x + 1.5,
      canvasHeight / 2 + 48 + l,
      3,
      '#8b0000')
    }
    context.restore()
  }
  if (k >= 3 && k < 8) {
    context.fillStyle = `rgba(0,0,0,${k<5?.85:.85-(k-5)*.2})`;
    context.fillRect(0,
    0,
    canvasWidth,
    canvasHeight);
    context.fillStyle = '#ccc';
    context.font = 'italic 17px Cinzel';
    context.textAlign = 'center';
    ['Kau terbangun di desa yang kau kenal... tapi semuanya berbeda.',
    'Kabut menyelimuti, bulan berwarna darah, tangisan terdengar dari kejauhan.',
    'Cari 5 artefak kuno, buka gerbang desa... sebelum THEY menemukanmu.'].forEach((l,
    i) => {
      const a = clamp((k - 3 - i * 1.3) /.8,
      0,
      1); context.globalAlpha = a; context.fillText(l,
      canvasWidth / 2,
      canvasHeight - 110 + i * 26)
    });
    context.globalAlpha = 1
  }
  if (k >= 8 && k < 15) {
    context.fillStyle = '#ffd700';
    context.font = '20px Cinzel';
    context.textAlign = 'center';
    context.fillText('Bertahan hidup!',
    canvasWidth / 2,
    60);
    context.font = '64px Cinzel';
    context.fillStyle = '#b30000';
    context.fillText(Math.ceil(15 - k),
    canvasWidth / 2,
    130)
  }
  if (k >= 18) {
    context.fillStyle = `rgba(0,0,0,${Math.min(1,(k-18)/1.2)})`;
    context.fillRect(0,
    0,
    canvasWidth,
    canvasHeight);
    context.fillStyle = '#ffd700';
    context.font = '30px Cinzel';
    context.textAlign = 'center';
    context.fillText('Apakah kamu siap?',
    canvasWidth / 2,
    canvasHeight / 2)
  }
  if (k < 8 || k >= 15) {
    context.fillStyle = '#000';
    const bh = k < 8 ? 60: 0;
    context.fillRect(0,
    0,
    canvasWidth,
    bh);
    context.fillRect(0,
    canvasHeight - bh,
    canvasWidth,
    bh)
  }
  if (!fsDone && k > 1) {
    context.fillStyle = '#fff7';
    context.font = '11px Cinzel';
    context.textAlign = 'center';
    context.fillText('Sentuh layar untuk suara & layar penuh',
    canvasWidth / 2,
    canvasHeight - 14)
  }
}
