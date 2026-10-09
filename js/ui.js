/*
 * ============================================================
 * UI.JS — aksi tombol global + state: INTRO, GATE, LOADING,
 *         GAMEPLAY, PAUSE, END, TOURNAMENT_END
 * (Layar lain ada di ui-menu / ui-profile / ui-charselect /
 *  ui-leaderboard / ui-shop .js)
 * ============================================================
 */
const Actions = {
  classic() { startRun('classic'); },
  train() { startRun('train'); },
  again() { startRun(MODE); },
  home() { goHome(); },
  resume() { pauseT(); },
  gate() { submitAccessCode(); },
  reg() { submitRegistration(); },
  edit() { UI.set(CHARACTER_SELECT_STATE, { first: false }); },
  csBack() { UI.set(MENU_STATE); },
  shopBack() { UI.set(MENU_STATE); },
  closeModal(btn) { const m = btn.closest('.modal'); if (m) UI.closeModal(m.id); },
  rankClose() {
    if (UI.params.mode === 'winners') Tournament.finishSession(); /* reset sesi setelah halaman pemenang */
    UI.set(MENU_STATE);
  }
};

/* Satu listener global (didaftarkan sekali, bukan per layar). */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b || b.disabled) return;
  SFX.click();
  if (b.classList.contains('b')) {
    const r = document.createElement('i'), q = b.getBoundingClientRect();
    r.className = 'rp'; r.style.left = e.clientX - q.left - 5 + 'px'; r.style.top = e.clientY - q.top - 5 + 'px';
    b.appendChild(r); setTimeout(() => r.remove(), 600);
  }
  const fn = Actions[b.dataset.a];
  if (fn) fn(b, e);
});
document.addEventListener('pointerover', e => { if (e.target.closest && e.target.closest('.b')) SFX.hover(); });

function pauseT() {
  if (UI.is(GAMEPLAY_STATE)) { UI.set(PAUSE_STATE); SFX.back(); }
  else if (UI.is(PAUSE_STATE)) UI.set(GAMEPLAY_STATE);
}
$('#pb').addEventListener('click', pauseT);
$('#sk').addEventListener('click', () => endIntro());

function goHome() {
  if (UI.is(PAUSE_STATE) && MODE == 'classic' && P) submitScore(score | 0);
  UI.set(MENU_STATE);
}
function endIntro() {
  if (!UI.is(INTRO_STATE)) return;
  M = []; slow = 1; routePlayer();
}
function startRun(mode) {
  if (UI.is(LOADING_STATE) || UI.is(GAMEPLAY_STATE)) return;
  if (mode === 'classic') Tournament.onStart();
  UI.set(LOADING_STATE, { mode });
}

UI.register(INTRO_STATE, {
  enter() { it = 0; I = {}; reset('classic'); P.x = 300; P.y = 430; }
});
UI.register(GATE_STATE, {
  enter(scope) {
    $('#code').value = ''; $('#ge').textContent = '';
    scope.timeout(() => $('#code').focus(), 300);
    scope.on($('#code'), 'keydown', e => { if (e.key === 'Enter') submitAccessCode(); });
  }
});
UI.register(LOADING_STATE, {
  enter(scope, p) {
    $('#tip').textContent = TIPS[R() * TIPS.length | 0]; SFX.door();
    const bar = $('#bar i'); bar.style.transition = 'none'; bar.style.width = '0';
    requestAnimationFrame(() => { bar.style.transition = 'width 1.6s'; bar.style.width = '100%'; });
    scope.timeout(() => {
      reset(p.mode);
      if (p.mode == 'classic') { newRun(); playerProfile.gamesPlayed++; savePlayerProfile(); }
      UI.set(GAMEPLAY_STATE, { fresh: true });
    }, 1700);
  }
});
UI.register(GAMEPLAY_STATE, {
  enter(scope, p) {
    last = performance.now();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); /* input nama/kode tidak boleh menelan tombol gerak */
    if (p.fresh) Tournament.flushPopup();
  }
});
UI.register(PAUSE_STATE, { enter() {} });
UI.register(END_STATE, {
  enter(scope, p) { scope.timeout(() => show('end', 1), p.delay ?? 900); }
});
UI.register(TOURNAMENT_END_STATE, {
  enter(scope, p) { Tournament.showEndScreen(scope, p.tid); }
});
