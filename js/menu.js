/* ===== MENU & INTRO ===== */
function menuScene() {
  const g = gameCanvasContext.createLinearGradient(0, 0, 0, canvasHeightValue);
  g.addColorStop(0, '#1a0000');
  g.addColorStop(1, '#0a0a0a');
  gameCanvasContext.fillStyle = g;
  gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
  for(let i = 0; i < 40; i++) {
    gameCanvasContext.fillStyle = '#fff6';
    gameCanvasContext.fillRect((i * 137) % canvasWidthValue, (i * 71) % 250, 1.5, 1.5)
  }
  fillCircle(720, 110, 44, '#8b0000');
  fillCircle(720, 110, 52, '#8b000030');
  [['#120808', .2, 330], ['#0d0505', .5, 400], ['#070303', 1, 460]].forEach(([c, sp, y], k) => {
    gameCanvasContext.fillStyle = c; gameCanvasContext.beginPath(); gameCanvasContext.moveTo(0, canvasHeightValue); for(let x = 0; x <= canvasWidthValue; x += 20)gameCanvasContext.lineTo(x, y - Math.sin((x + t * 20 * sp) * .015 *(k + 1)) * 30 - k * 10); gameCanvasContext.lineTo(canvasWidthValue, canvasHeightValue); gameCanvasContext.fill()
  });
  gameCanvasContext.fillStyle = 'rgba(160,150,170,.07)';
  for(let i = 0; i < 4; i++)gameCanvasContext.fillRect(((t * 15 *(i + 1)) %(canvasWidthValue + 400)) - 300, 300 + i * 40, 400, 40);
  if(weather == 'rain') {
    gameCanvasContext.strokeStyle = '#8ab5';
    gameCanvasContext.beginPath();
    for(let i = 0; i < 90; i++) {
      const x =(i * 91 + t * 200) % canvasWidthValue,
      y =(i * 47 + t * 600) % canvasHeightValue;
      gameCanvasContext.moveTo(x, y);
      gameCanvasContext.lineTo(x - 3, y + 12)
    }
    gameCanvasContext.stroke()
  }
  for(const f of fireflies) {
    f.x += Math.sin(t + f.p) * .4;
    f.y += Math.cos(t * .7 + f.p) * .3;
    fillCircle(f.x, f.y, 2, `rgba(255,220,80,${.5+Math.sin(t*3+f.p)*.5})`)
  }
  gameCanvasContext.save();
  gameCanvasContext.translate(200, 430);
  const b = Math.sin(t * 2) * 2;
  gameCanvasContext.fillStyle = '#000';
  gameCanvasContext.beginPath();
  gameCanvasContext.ellipse(0, 40, 30, 8, 0, 0, 7);
  gameCanvasContext.fill();
  gameCanvasContext.fillStyle = '#2b2b2b';
  gameCanvasContext.fillRect( - 10, 20, 8, 20);
  gameCanvasContext.fillRect(3, 20, 8, 20);
  fillCircle(0, 0 + b, 18, '#4a3b30');
  fillCircle(0, - 26 + b, 11, '#d8b99a');
  if((t % 4) > .15) {
    fillCircle(3, - 26 + b, 2, '#000');
    fillCircle(9, - 26 + b, 2, '#000')
  }
  gameCanvasContext.restore()
}
function introScene() {
  const k = it;
  let s;
  gameCanvasContext.fillStyle = '#000';
  if(k < 3) {
    gameCanvasContext.save();
    gameCanvasContext.globalAlpha = Math.min(1, k / 1.5);
    gameCanvasContext.fillStyle = '#b30000';
    gameCanvasContext.font = '46px Creepster';
    gameCanvasContext.textAlign = 'center';
    gameCanvasContext.fillText('MALAM KELAM', canvasWidthValue / 2, canvasHeightValue / 2 - 10);
    gameCanvasContext.fillText('DI DESA TERKUTUK', canvasWidthValue / 2, canvasHeightValue / 2 + 40);
    gameCanvasContext.fillStyle = '#8b0000';
    for(let i = 0; i < 9; i++) {
      const x = canvasWidthValue / 2 - 200 + i * 50,
      l = Math.min(1, k / 3) *(20 +(i * 37 % 40));
      gameCanvasContext.fillRect(x, canvasHeightValue / 2 + 48, 3, l);
      fillCircle(x + 1.5, canvasHeightValue / 2 + 48 + l, 3, '#8b0000')
    }
    gameCanvasContext.restore()
  }
  if(k >= 3 && k < 8) {
    gameCanvasContext.fillStyle = `rgba(0,0,0,${k<5?.85:.85-(k-5)*.2})`;
    gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
    gameCanvasContext.fillStyle = '#ccc';
    gameCanvasContext.font = 'italic 17px Cinzel';
    gameCanvasContext.textAlign = 'center';
    ['Kau terbangun di desa yang kau kenal... tapi semuanya berbeda.', 'Kabut menyelimuti, bulan berwarna darah, tangisan terdengar dari kejauhan.', 'Cari 5 artefak kuno, buka gerbang desa... sebelum THEY menemukanmu.'].forEach((l, i) => {
      const a = clampValue((k - 3 - i * 1.3) / .8, 0, 1); gameCanvasContext.globalAlpha = a; gameCanvasContext.fillText(l, canvasWidthValue / 2, canvasHeightValue - 110 + i * 26)
    });
    gameCanvasContext.globalAlpha = 1
  }
  if(k >= 8 && k < 15) {
    gameCanvasContext.fillStyle = '#ffd700';
    gameCanvasContext.font = '20px Cinzel';
    gameCanvasContext.textAlign = 'center';
    gameCanvasContext.fillText('Bertahan hidup!', canvasWidthValue / 2, 60);
    gameCanvasContext.font = '64px Cinzel';
    gameCanvasContext.fillStyle = '#b30000';
    gameCanvasContext.fillText(Math.ceil(15 - k), canvasWidthValue / 2, 130)
  }
  if(k >= 18) {
    gameCanvasContext.fillStyle = `rgba(0,0,0,${Math.min(1,(k-18)/1.2)})`;
    gameCanvasContext.fillRect(0, 0, canvasWidthValue, canvasHeightValue);
    gameCanvasContext.fillStyle = '#ffd700';
    gameCanvasContext.font = '30px Cinzel';
    gameCanvasContext.textAlign = 'center';
    gameCanvasContext.fillText('Apakah kamu siap?', canvasWidthValue / 2, canvasHeightValue / 2)
  }
  if(k < 8 || k >= 15) {
    gameCanvasContext.fillStyle = '#000';
    const bh = k < 8?60:0;
    gameCanvasContext.fillRect(0, 0, canvasWidthValue, bh);
    gameCanvasContext.fillRect(0, canvasHeightValue - bh, canvasWidthValue, bh)
  }
  if(!fsDone && k > 1) {
    gameCanvasContext.fillStyle = '#fff7';
    gameCanvasContext.font = '11px Cinzel';
    gameCanvasContext.textAlign = 'center';
    gameCanvasContext.fillText('Sentuh layar untuk suara & layar penuh', canvasWidthValue / 2, canvasHeightValue - 14)
  }
}
