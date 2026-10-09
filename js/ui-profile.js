/*
 * ============================================================
 * UI-PROFILE.JS — Modal profil + karakter interaktif (idle / melirik / menebas)
 * ============================================================
 */
const Profile = (() => {
  function fill() {
    const c = getCurrentCharacterClass(), s = playerProfile.stats;
    $('#pn').textContent = playerProfile.name;
    $('#pid').textContent = `ID ${playerProfile.uid}`;
    $('#pmClass').innerHTML = `${c.emoji} ${escapeHtml(c.name)}<br><small>${escapeHtml(c.skillName)}</small>`;
    const cell = (label, val, cls = '') => `<div class="stat ${cls}"><small>${label}</small><b>${val}</b></div>`;
    $('#pd').innerHTML =
      cell('Nama', escapeHtml(playerProfile.name), 'wide') +
      cell('Malam Terlampaui', s.night || 0) +
      cell('Monster Sampah Dibasmi', s.kills || 0) +
      cell('Total Skor / Poin', playerProfile.totalScore) +
      cell('Skor Terbaik', playerProfile.bestScore) +
      cell('Koin', '🪙 ' + (playerProfile.coins | 0)) +
      cell('Peringkat', rankText(playerProfile.bestScore)) +
      cell('Achievement', `${playerProfile.achievements.length}/${ACHIEVEMENTS.length}`);
    $('#pa').innerHTML = ACHIEVEMENTS.map(a => `<span class="ac ${playerProfile.achievements.includes(a.id) ? 'on' : ''}">${escapeHtml(a.name)}</span>`).join('');
  }
  function open() {
    UI.openModal('prof', scope => {
      fill();
      const cv = $('#pmChar'), g = cv.getContext('2d'), id = getCurrentCharacterClass().id;
      let act = 'idle', actT = 0, next = 1.4, look = 0, swing = 0, last = performance.now(), tt = 0;
      scope.raf(now => {
        const dt = Math.min(.05, (now - last) / 1000); last = now; tt += dt; actT += dt;
        if (act === 'idle' && actT > next) { act = Math.random() < .5 ? 'look' : 'slash'; actT = 0; }
        if (act === 'look') { look = Math.sin(actT * 5) * 1; if (actT > 1.6) { act = 'idle'; actT = 0; next = 1.2 + Math.random() * 2.2; look = 0; } }
        else if (act === 'slash') { swing = Math.min(1, actT / .45); if (actT > .75) { act = 'idle'; actT = 0; next = 1.2 + Math.random() * 2.2; swing = 0; } }
        const w = cv.width, h = cv.height;
        g.clearRect(0, 0, w, h);
        const sp = g.createRadialGradient(w / 2, h * .1, 10, w / 2, h * .75, h * .8); sp.addColorStop(0, 'rgba(255,240,200,.35)'); sp.addColorStop(1, 'rgba(255,240,200,0)');
        g.fillStyle = sp; g.beginPath(); g.moveTo(w * .42, 0); g.lineTo(w * .58, 0); g.lineTo(w * .98, h); g.lineTo(w * .02, h); g.fill();
        const fl = Math.sin(tt * 2) * 6;
        g.fillStyle = '#000a'; g.beginPath(); g.ellipse(w / 2, h - 28, 46 - fl * .8, 9, 0, 0, 7); g.fill();
        Sprites.draw(g, id, { x: w / 2, y: h - 34 + fl, s: 1.9, t: tt, look, swing, wcolor: Loadout.mods().color });
        if (act === 'slash' && actT > .1 && actT < .55) { g.globalAlpha = 1 - (actT - .1) / .45; g.strokeStyle = Loadout.mods().color || '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2 + 30, h * .5, 90, -1.1, 1.3); g.stroke(); g.globalAlpha = 1; }
      });
    });
  }
  return { open };
})();
