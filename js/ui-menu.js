/*
 * ============================================================
 * UI-MENU.JS — MENU_STATE: profile bar, START/TRAINING, sidebar drawer, credits
 * ============================================================
 */
function renderMenu() {
  const c = getCurrentCharacterClass();
  Sprites.icon($('#pbAvatar'), c.id);
  $('#pbName').textContent = playerProfile.name || 'PLAYER';
  $('#pbSub').textContent = `🪙 ${playerProfile.coins | 0} · ${c.name}`;
  $('#mi').textContent = playerProfile.name ? `ID ${playerProfile.uid}` : '';
  $('#lb').innerHTML = playerProfile.name
    ? `Skor terbaik <b style="color:#ffd700">${playerProfile.bestScore}</b> · Rank ${rankText(playerProfile.bestScore)}` + (playerProfile.skinUnlocked ? ' · Skin emas' : '')
    : '';
  $('#drRank').classList.toggle('locked', Tournament.isLeaderboardLocked());
  const ds = MLDatabase.status(), el = $('#dbStatus');
  if (el) {
    el.textContent = ds.provider === 'firebase' ? (ds.online ? '☁ Firebase terhubung' : '💾 Mode lokal (Firebase gagal)') : '💾 Database lokal';
    el.className = ds.provider === 'firebase' ? (ds.online ? 'ok' : 'warn') : '';
    el.title = ds.error || '';
  }
  Tournament.renderHud();
}

function openCredits() {
  UI.openModal('credits', scope => {
    $('#creditsNames').innerHTML = (GAME_CONFIG.ui.credits || []).map(escapeHtml).map(n => `<div>${n}</div>`).join('');
    scope.on(window, 'keydown', e => { if (e.key === 'Escape') UI.closeModal('credits'); });
  });
}

UI.register(MENU_STATE, {
  enter(scope) {
    renderMenu();
    const drawer = $('#drawer'), tab = $('#drawerTab'), arrow = tab.querySelector('.arrow');
    let open = false, swiped = false, sx = null;
    const setOpen = v => { open = v; drawer.classList.toggle('open', v); tab.setAttribute('aria-expanded', String(v)); arrow.textContent = v ? '<' : '>'; };
    setOpen(false);
    scope.add(() => { drawer.classList.remove('open'); });

    scope.on(tab, 'click', () => { if (swiped) { swiped = false; return; } SFX.click(); setOpen(!open); });
    const down = e => { sx = e.clientX; };
    const up = e => {
      if (sx === null) return; const dx = e.clientX - sx; sx = null;
      if (dx > 40 && !open) { swiped = true; setOpen(true); SFX.click(); }
      else if (dx < -40 && open) { swiped = true; setOpen(false); SFX.back(); }
    };
    scope.on(tab, 'pointerdown', down); scope.on(drawer, 'pointerdown', down);
    scope.on(window, 'pointerup', up);
    scope.on(window, 'pointercancel', () => { sx = null; });
    scope.on(document, 'pointerdown', e => { if (open && !drawer.contains(e.target)) setOpen(false); });

    drawer.querySelectorAll('.dr-item').forEach(btn => scope.on(btn, 'click', () => {
      const go = btn.dataset.go;
      if (go === 'credits') { SFX.click(); setOpen(false); openCredits(); }
      else if (go === 'shop') {
        if (Tournament.phase() === 'running' && GAME_CONFIG.shop.availableDuringTournament === false) { toast('Shop ditutup selama turnamen!', 'bad'); SFX.deny(); return; }
        SFX.click(); UI.set(SHOP_STATE);
      } else if (go === 'rank') {
        if (Tournament.isLeaderboardLocked()) {
          SFX.deny(); toast('🔒 Leaderboard terkunci sampai turnamen berakhir!', 'bad');
          btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        } else { SFX.click(); UI.set(LEADERBOARD_STATE, { mode: 'general' }); }
      }
    }));
    scope.on($('#profileBar'), 'click', () => { SFX.click(); setOpen(false); Profile.open(); });
    scope.on(window, 'keydown', e => {
      if (e.key !== 'Escape') return;
      if (UI.isModalOpen('prof')) UI.closeModal('prof'); else if (UI.isModalOpen('credits')) UI.closeModal('credits'); else if (open) setOpen(false);
    });
    scope.add(Events.on('profile', () => { if (UI.is(MENU_STATE)) renderMenu(); }));
    scope.interval(() => { $('#drRank').classList.toggle('locked', Tournament.isLeaderboardLocked()); }, 1000);
  }
});
Events.on('ui', () => Tournament.renderHud());
