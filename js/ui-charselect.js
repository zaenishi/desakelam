/*
 * ============================================================
 * UI-CHARSELECT.JS — CHARACTER_SELECT_STATE
 * Sprite melayang + spotlight, statistik, preview senjata & skill.
 * Karakter terkunci setelah dikonfirmasi (selama sesi, lihat config.session).
 * ============================================================
 */
function charStats(c) {
  const A = c.attack, dps = c.damageMultiplier * A.damage * A.hits / A.cooldown * weaponMods().dmg;
  return [
    ['HP', Math.round(100 * c.hpMultiplier), c.hpMultiplier / 1.3],
    ['Kecepatan', 'x' + c.speedMultiplier.toFixed(2), c.speedMultiplier / 1.25],
    ['Damage/detik', Math.round(dps), dps / 48],
    ['Cooldown skill', c.skillCooldown + ' dtk', 1 - (c.skillCooldown - 4) / 8]
  ];
}

function selectCharacter(i) {
  selectedCharacterIndex = Math.max(0, Math.min(CHARACTER_CLASSES.length - 1, i));
  const c = CHARACTER_CLASSES[selectedCharacterIndex];
  document.querySelectorAll('.cs-thumb').forEach(b => b.classList.toggle('on', +b.dataset.i === selectedCharacterIndex));
  $('#csName').textContent = c.name; $('#csRole').textContent = c.role;
  $('#csDesc').textContent = c.description;
  $('#csStats').innerHTML = charStats(c).map(([l, v, p]) => `<div class="st"><span>${l}</span><i><u style="width:${Math.round(Math.max(.08, Math.min(1, p)) * 100)}%;background:${c.accent}"></u></i><b>${v}</b></div>`).join('');
  $('#csWName').textContent = c.weapon.name; $('#csWDesc').textContent = c.weapon.desc;
  $('#csSName').textContent = c.skillName; $('#csSDesc').textContent = c.description;
  $('#re').textContent = '';
}

function submitRegistration() {
  const name = $('#nm').value.trim().replace(GAME_CONFIG.registration.allowedNamePattern, '');
  if (name.length < GAME_CONFIG.registration.minNameLength) {
    $('#re').style.color = '#f55';
    $('#re').textContent = `Nama minimal ${GAME_CONFIG.registration.minNameLength} karakter (huruf/angka).`;
    SFX.hurt(); return;
  }
  playerProfile.name = GAME_CONFIG.registration.uppercaseName === false ? name : name.toUpperCase();
  if (!isCharacterLocked()) playerProfile.characterIndex = selectedCharacterIndex;
  if (!playerProfile.uid) playerProfile.uid = createUniquePlayerId(playerProfile.name);
  if (GAME_CONFIG.session.lockCharacter) playerProfile.charLocked = true; /* permanen untuk sesi ini */
  savePlayerProfile();
  SFX.lvl();
  UI.set(MENU_STATE);
}

UI.register(CHARACTER_SELECT_STATE, {
  enter(scope, p) {
    const locked = isCharacterLocked();
    selectedCharacterIndex = playerProfile.characterIndex || 0;
    $('#nm').value = playerProfile.name || '';
    $('#csLock').hidden = !locked;
    $('#csBack').hidden = !isLoggedIn() && !playerProfile.name;
    $('#csConfirm').textContent = playerProfile.name ? 'SIMPAN' : 'PILIH & MULAI';
    $('#re').style.color = '#caa';
    $('#csThumbs').innerHTML = CHARACTER_CLASSES.map((c, i) => `<button class="cs-thumb" data-i="${i}" type="button" ${locked && i !== selectedCharacterIndex ? 'disabled' : ''}><canvas width="56" height="56"></canvas><span>${escapeHtml(c.name.split(' ')[0])}</span></button>`).join('');
    document.querySelectorAll('.cs-thumb').forEach((b, i) => {
      Sprites.icon(b.querySelector('canvas'), CHARACTER_CLASSES[i].id);
      scope.on(b, 'click', () => { if (locked) { SFX.deny(); toast('Karakter terkunci untuk sesi ini', 'bad'); return; } SFX.click(); selectCharacter(i); });
    });
    scope.on(window, 'keydown', e => {
      if (e.target && e.target.tagName === 'INPUT' && e.key !== 'Enter') return;
      if (locked) return;
      if (e.key === 'ArrowLeft') { selectCharacter((selectedCharacterIndex + CHARACTER_CLASSES.length - 1) % CHARACTER_CLASSES.length); SFX.hover(); }
      else if (e.key === 'ArrowRight') { selectCharacter((selectedCharacterIndex + 1) % CHARACTER_CLASSES.length); SFX.hover(); }
    });
    scope.on($('#nm'), 'keydown', e => { if (e.key === 'Enter') submitRegistration(); });
    selectCharacter(selectedCharacterIndex);

    const st = $('#csStage'), sg = st.getContext('2d'), wc = $('#csWeapon').getContext('2d'), kc = $('#csSkill').getContext('2d');
    let tt = 0, prev = performance.now();
    scope.raf(now => {
      const dt = Math.min(.05, (now - prev) / 1000); prev = now; tt += dt;
      const c = CHARACTER_CLASSES[selectedCharacterIndex], w = st.width, h = st.height;
      sg.clearRect(0, 0, w, h);
      /* spotlight */
      const cone = sg.createLinearGradient(0, 0, 0, h); cone.addColorStop(0, 'rgba(255,244,210,.55)'); cone.addColorStop(1, 'rgba(255,244,210,.04)');
      sg.fillStyle = cone; sg.beginPath(); sg.moveTo(w * .4, 0); sg.lineTo(w * .6, 0); sg.lineTo(w * .96, h - 40); sg.lineTo(w * .04, h - 40); sg.closePath(); sg.fill();
      const pool = sg.createRadialGradient(w / 2, h - 52, 4, w / 2, h - 52, 150); pool.addColorStop(0, c.accent + 'aa'); pool.addColorStop(1, 'transparent');
      sg.fillStyle = pool; sg.beginPath(); sg.ellipse(w / 2, h - 52, 150, 34, 0, 0, 7); sg.fill();
      const fl = Math.sin(tt * 2.2) * 8;
      sg.fillStyle = '#000b'; sg.beginPath(); sg.ellipse(w / 2, h - 52, 52 - fl * .9, 10, 0, 0, 7); sg.fill();
      for (let i = 0; i < 12; i++) { const a = tt * .6 + i * 2.4, r = 70 + (i % 4) * 22; sg.globalAlpha = .35 + .35 * Math.sin(tt * 2 + i); sg.fillStyle = c.accent; sg.beginPath(); sg.arc(w / 2 + Math.cos(a) * r, h * .5 + Math.sin(a * 1.3) * 90, 2, 0, 7); sg.fill(); }
      sg.globalAlpha = 1;
      const sw = (tt % 4.5) > 3.8 ? ((tt % 4.5) - 3.8) / .7 : 0;
      Sprites.draw(sg, c.id, { x: w / 2, y: h - 58 + fl, s: 2.35, t: tt, look: Math.sin(tt * .8), swing: sw, wcolor: Loadout.mods().color });
      Sprites.demo(wc, c.id, 'weapon', tt, 230, 120, Loadout.mods().color);
      Sprites.demo(kc, c.id, 'skill', tt, 230, 120, null);
    });
    if (p && p.first) scope.timeout(() => $('#nm').focus(), 400);
  }
});
