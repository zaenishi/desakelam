/*
 * ============================================================
 * CINEMATIC.JS — adegan penutup (digambar di canvas utama)
 * ============================================================
 *  0–3.5s   Desa Kelam dikepung Monster Sampah
 *  3.5–7s   Gelombang cahaya menyapu desa, monster lenyap
 *  7–12.5s  Desa cerah & bersih, warga bersorak
 *  12.5–17s Pesan edukasi: "Jaga Kebersihan Lingkungan Sekolah & Sekitarmu!"
 * Dijalankan oleh game loop (main.js) -> tidak ada RAF/timer tambahan yang bisa menumpuk.
 */
const Cinematic = (() => {
  const DUR = 17, HZ = 330;
  let cs = null;

  const DARK = { sky: ['#12080f', '#2a1620'], ground: ['#241a14', '#15100c'], house: '#2a1d16', roof: '#1a1010', win: '#3a2a10', tree: '#14231a', hill: '#0e1a14' };
  const LIGHT = { sky: ['#5dbcff', '#d8f3ff'], ground: ['#79d155', '#4fa83a'], house: '#f4dba5', roof: '#d9534f', win: '#fff3b0', tree: '#2e9e44', hill: '#7fd067' };

  function drawVillage(pal, bright, tt) {
    const g = X.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, pal.sky[0]); g.addColorStop(1, pal.sky[1]); X.fillStyle = g; X.fillRect(0, 0, W, HZ + 2);
    if (bright) {
      X.fillStyle = '#fff6b8'; X.beginPath(); X.arc(780, 90, 42, 0, 7); X.fill();
      X.strokeStyle = '#fff3a0aa'; X.lineWidth = 3; for (let i = 0; i < 14; i++) { const a = i * Math.PI / 7 + tt * .3; X.beginPath(); X.moveTo(780 + Math.cos(a) * 54, 90 + Math.sin(a) * 54); X.lineTo(780 + Math.cos(a) * 80, 90 + Math.sin(a) * 80); X.stroke(); }
      X.fillStyle = '#ffffffcc'; [[150, 70], [420, 100], [600, 55]].forEach(([x, y], i) => { const dx = (tt * 8 + i * 200) % (W + 200) - 100 + (x - 300) * .0; X.beginPath(); X.arc(dx, y, 22, 0, 7); X.arc(dx + 24, y + 4, 18, 0, 7); X.arc(dx - 24, y + 5, 16, 0, 7); X.fill(); });
    } else {
      X.fillStyle = '#8b0000'; X.beginPath(); X.arc(720, 90, 40, 0, 7); X.fill(); X.fillStyle = '#8b000033'; X.beginPath(); X.arc(720, 90, 56, 0, 7); X.fill();
    }
    X.fillStyle = pal.hill; X.beginPath(); X.moveTo(0, HZ); for (let x = 0; x <= W; x += 20) X.lineTo(x, HZ - 40 - Math.sin(x * .012) * 22); X.lineTo(W, HZ); X.fill();
    const gg = X.createLinearGradient(0, HZ, 0, H); gg.addColorStop(0, pal.ground[0]); gg.addColorStop(1, pal.ground[1]); X.fillStyle = gg; X.fillRect(0, HZ, W, H - HZ);
    [[40, 300], [880, 310], [470, 292]].forEach(([x, y]) => { X.fillStyle = bright ? '#7a4b22' : '#2a1a10'; X.fillRect(x - 5, y, 10, 40); X.fillStyle = pal.tree; X.beginPath(); X.arc(x, y - 6, 30, 0, 7); X.arc(x - 20, y + 8, 22, 0, 7); X.arc(x + 20, y + 8, 22, 0, 7); X.fill(); });
    [90, 300, 520, 740].forEach((x, i) => {
      const y = HZ + 8 + (i % 2) * 14;
      X.fillStyle = pal.house; X.fillRect(x, y - 60, 110, 70);
      X.fillStyle = pal.roof; X.beginPath(); X.moveTo(x - 10, y - 58); X.lineTo(x + 55, y - 108); X.lineTo(x + 120, y - 58); X.fill();
      X.fillStyle = pal.win; X.fillRect(x + 14, y - 42, 24, 24); X.fillRect(x + 70, y - 42, 24, 24);
      X.fillStyle = bright ? '#8b5a2b' : '#0c0806'; X.fillRect(x + 46, y - 28, 18, 38);
    });
    if (!bright) { /* tumpukan sampah di mana-mana */
      [[60, 420], [250, 470], [430, 440], [640, 480], [820, 430], [930, 480]].forEach(([x, y], i) => {
        X.fillStyle = '#2e4a2a'; X.beginPath(); X.arc(x, y, 26, 0, 7); X.arc(x + 20, y + 6, 20, 0, 7); X.arc(x - 18, y + 8, 18, 0, 7); X.fill();
        X.fillStyle = '#cfd8dc'; X.fillRect(x - 6, y - 24, 6, 12); X.fillStyle = '#d32f2f'; X.fillRect(x + 8, y - 6, 9, 6);
        X.fillStyle = '#d8e2e8aa'; X.beginPath(); X.arc(x + Math.sin(tt * 2 + i) * 14, y - 40 - (i % 3) * 8, 7, 0, 7); X.fill();
      });
    } else { /* bunga & tempat sampah */
      for (let i = 0; i < 26; i++) { const x = (i * 83) % W, y = HZ + 40 + (i * 37) % 170; X.fillStyle = ['#ff6fa8', '#ffd54a', '#fff', '#ff8a4a'][i % 4]; X.beginPath(); X.arc(x, y, 3.2, 0, 7); X.fill(); X.fillStyle = '#2f8a2f'; X.fillRect(x - 1, y + 2, 2, 7); }
      [['#2e9e44', 'ORG'], ['#f2c400', 'ANO'], ['#d32f2f', 'B3']].forEach(([c, l], i) => { const x = 380 + i * 62, y = 470; X.fillStyle = c; X.fillRect(x, y - 36, 44, 44); X.fillStyle = '#0003'; X.fillRect(x - 3, y - 40, 50, 6); X.fillStyle = '#fff'; X.font = 'bold 12px Cinzel,serif'; X.textAlign = 'center'; X.fillText(l, x + 22, y - 10); });
    }
  }

  function villager(x, y, col, tt, i) {
    const jump = Math.abs(Math.sin(tt * 5 + i)) * 20, yy = y - jump, arm = Math.sin(tt * 10 + i) * .5;
    X.fillStyle = '#0004'; X.beginPath(); X.ellipse(x, y + 12, 12 - jump * .15, 4, 0, 0, 7); X.fill();
    X.strokeStyle = col; X.lineWidth = 4; X.lineCap = 'round';
    X.beginPath(); X.moveTo(x - 8, yy - 14); X.lineTo(x - 15, yy - 34 - arm * 8); X.moveTo(x + 8, yy - 14); X.lineTo(x + 15, yy - 34 + arm * 8); X.stroke();
    X.fillStyle = col; X.beginPath(); X.moveTo(x - 9, yy - 20); X.lineTo(x + 9, yy - 20); X.lineTo(x + 12, yy + 8); X.lineTo(x - 12, yy + 8); X.fill();
    X.fillStyle = '#e2bf9c'; X.beginPath(); X.arc(x, yy - 28, 8, 0, 7); X.fill();
    X.fillStyle = i % 2 ? '#3a2a1a' : '#1a1a1a'; X.beginPath(); X.arc(x, yy - 31, 8.2, Math.PI, 0); X.fill();
    X.fillStyle = '#000'; X.fillRect(x - 4, yy - 28, 2, 2); X.fillRect(x + 2, yy - 28, 2, 2); X.fillRect(x - 3, yy - 24, 6, 1.5);
  }

  function mkMon(k, x, y) { const d = T[k]; return { k, t: d, x, y, r: d.r * 1.6, hp: 1, mh: 1, st: 'chase', stt: 0, fl: 0, face: Math.PI, guard: 0, stun: 0 }; }

  function text(str, y, size, col, alpha = 1) {
    X.save(); X.globalAlpha = alpha; X.textAlign = 'center'; X.font = `${size}px Cinzel,serif`; X.lineWidth = 5; X.strokeStyle = '#000b'; X.strokeText(str, W / 2, y); X.fillStyle = col; X.fillText(str, W / 2, y); X.restore();
  }

  function play(onDone) {
    cs = {
      tt: 0, onDone, conf: [], spark: [], flags: {},
      mons: [mkMon('sh', 760, 400), mkMon('sp', 650, 460), mkMon('bo', 880, 450), mkMon('gh', 540, 380), mkMon('sh', 420, 470), mkMon('wo', 300, 420)],
      people: Array.from({ length: 9 }, (_, i) => ({ x: 70 + i * 100 + (i % 2) * 20, y: 430 + (i % 3) * 22, c: ['#e53935', '#1e88e5', '#fdd835', '#8e24aa', '#43a047', '#fb8c00'][i % 6] }))
    };
    UI.set(CINEMATIC_STATE);
  }

  function frame(dt) {
    if (!cs) return;
    const tt = cs.tt += dt;
    const reveal = cl((tt - 3.5) / 3.5, 0, 1), R0 = reveal * 1150;
    X.save();
    drawVillage(DARK, false, tt);
    cs.mons.forEach((m, i) => {
      m.face = Math.atan2(HZ + 100 - m.y, 480 - m.x) + Math.PI; m.t_ = tt;
      const dx = m.x - 480, dy = (m.y - 460) * 1.6, d = Math.hypot(dx, dy);
      if (tt < 3.5) { m.x += Math.sin(tt * 3 + i) * .6; m.y += Math.cos(tt * 2.4 + i) * .4; }
      if (d < R0 && m.st != 'death') { m.st = 'death'; m.stt = 0; for (let k = 0; k < 14; k++) cs.spark.push({ x: m.x, y: m.y, vx: R() * 160 - 80, vy: -R() * 140, t: 1 + R() * .6, c: ['#fff', '#fff3a0', '#9cff9c'][k % 3] }); try { SFX.zap(); } catch (e) {} }
      if (m.st == 'death') m.stt = Math.min(.69, m.stt + dt); if (m.st == 'death' && m.stt >= .69) m.gone = 1;
      if (!m.gone) dM(m);
    });
    if (tt > 3.5) {
      X.save(); X.beginPath(); X.arc(480, 460, R0, 0, 7); X.clip();
      drawVillage(LIGHT, true, tt);
      cs.people.forEach((p, i) => { if (tt > 6.2) villager(p.x, p.y, p.c, tt, i); });
      X.restore();
      if (reveal < 1) { const g = X.createRadialGradient(480, 460, Math.max(1, R0 - 90), 480, 460, R0 + 30); g.addColorStop(0, '#fff0'); g.addColorStop(.7, '#fff7c4aa'); g.addColorStop(1, '#fff0'); X.fillStyle = g; X.fillRect(0, 0, W, H); }
    }
    if (tt > 3.5 && !cs.flags.chime) { cs.flags.chime = 1; try { SFX.chime(); } catch (e) {} }
    if (tt > 7 && !cs.flags.cheer) { cs.flags.cheer = 1; try { SFX.cheer(); SFX.fanfare(); } catch (e) {} for (let i = 0; i < 140; i++) cs.conf.push({ x: R() * W, y: -R() * 300, vy: 60 + R() * 120, vx: R() * 60 - 30, c: ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb'][i % 5], r: R() * 6, s: 3 + R() * 4 }); }
    if (tt > 9.6 && !cs.flags.cheer2) { cs.flags.cheer2 = 1; try { SFX.cheer(); } catch (e) {} }
    cs.spark.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; p.t -= dt; X.globalAlpha = Math.max(0, p.t); X.fillStyle = p.c; X.fillRect(p.x, p.y, 4, 4); }); X.globalAlpha = 1;
    cs.spark = cs.spark.filter(p => p.t > 0);
    cs.conf.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6; X.save(); X.translate(p.x, p.y); X.rotate(p.r); X.fillStyle = p.c; X.fillRect(-p.s / 2, -p.s, p.s, p.s * 2); X.restore(); if (p.y > H + 10) { p.y = -10; p.x = R() * W; } });
    /* teks per fase */
    if (tt < 3.5) text('Desa Kelam dikepung Monster Sampah...', 64, 24, '#ffb3b3', cl(tt, 0, 1));
    else if (tt < 7) text('Semangat para pahlawan membersihkan desa!', 64, 24, '#fff6b8', cl(tt - 3.5, 0, 1));
    else if (tt < 12.5) { text('HOREEE! Desa Kelam kembali cerah!', 64, 30, '#ffffff', cl(tt - 7, 0, 1)); }
    else {
      const a = cl((tt - 12.5) / 1.2, 0, 1);
      X.fillStyle = `rgba(0,30,10,${.62 * a})`; X.fillRect(0, 0, W, H);
      X.save(); X.globalAlpha = a; X.translate(W / 2, H / 2 - 50 + (1 - a) * 20);
      X.strokeStyle = '#69f0ae'; X.lineWidth = 8; X.lineCap = 'round'; X.lineJoin = 'round';
      for (let i = 0; i < 3; i++) { const an = tt * .8 + i * Math.PI * 2 / 3; X.beginPath(); X.arc(0, 0, 44, an, an + 1.6); X.stroke(); const hx = Math.cos(an + 1.6) * 44, hy = Math.sin(an + 1.6) * 44; X.beginPath(); X.moveTo(hx, hy); X.lineTo(hx + Math.cos(an + 2.3) * 14, hy + Math.sin(an + 2.3) * 14); X.stroke(); }
      X.restore();
      text('Jaga Kebersihan', H / 2 + 40, 40, '#ffffff', a); text('Lingkungan Sekolah & Sekitarmu!', H / 2 + 88, 40, '#ffe066', a);
      text('Buang sampah pada tempatnya  •  Pilah  •  Daur ulang', H / 2 + 132, 18, '#c8ffd9', a);
    }
    X.restore();
    if (tt >= DUR) finish();
  }
  function finish() { const cb = cs && cs.onDone; cs = null; if (cb) cb(); }
  function skip() { if (cs) finish(); }
  const active = () => !!cs;

  UI.register(CINEMATIC_STATE, {
    enter(scope) { const b = $('#cineSkip'); if (b) { scope.on(b, 'click', e => { e.stopPropagation(); skip(); }); } scope.on(window, 'keydown', e => { if (e.code === 'Escape' || e.code === 'Enter') skip(); }); },
    exit() { cs = null; }
  });
  return { play, frame, skip, active };
})();
