/* ===== UI ===== */
document.addEventListener('click', e => {
  const chc = e.target.closest('.chc');
  if (chc) { SFX.click(); selectCharacter(+chc.dataset.i); return; }

  const btn = e.target.closest('.b');
  if (!btn) return;
  SFX.click();

  /* ripple effect */
  const ripple = document.createElement('i');
  const rect = btn.getBoundingClientRect();
  ripple.className = 'rp';
  ripple.style.left = e.clientX - rect.left - 5 + 'px';
  ripple.style.top  = e.clientY - rect.top  - 5 + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);

  const action = btn.dataset.a;
  switch (action) {
    case 'classic':
    case 'train':    begin(action); break;
    case 'again':    begin(MODE); break;
    case 'home':     toMenu(); break;
    case 'resume':   pauseT(); break;
    case 'rank':     openRanking(); break;
    case 'prof':     openProfile(); break;
    case 'credits':  openCredits(); break;
    case 'close':    toMenu(); break;
    case 'gate':     submitAccessCode(); break;
    case 'reg':      submitRegistration(); break;
    case 'edit':     showRegistration(); break;
  }
});

document.addEventListener('pointerover', e => {
  if (e.target.closest && e.target.closest('.b')) SFX.hover();
});

const show = (id, visible) => $('#' + id).classList.toggle('hide', !visible);

function pauseT() {
  if (S === 'play')      { S = 'pause'; show('pause', 1); SFX.back(); }
  else if (S === 'pause'){ S = 'play';  show('pause', 0); }
}

$('#pb').onclick = pauseT;
$('#sk').onclick = () => { if (S === 'intro') endIntro(); };

function renderLeaderboardPreview() {
  const c = getCurrentCharacterClass();
  $('#mi').textContent = playerProfile.name
    ? `${playerProfile.name} - ${playerProfile.uid} [${c.name}]`
    : '';
  $('#lb').innerHTML = playerProfile.name
    ? `Skor terbaik <b style="color:#ffd700">${playerProfile.bestScore}</b> · Rank #${getPlayerRank(playerProfile.bestScore)}` +
      (playerProfile.skinUnlocked ? ' · Skin emas' : '')
    : '';
}

/* ---------- Credits ---------- */
function openCredits() {
  show('menu', 0);
  const cfg = GAME_CONFIG.credits;
  $('#crTitle').textContent    = cfg.title;
  $('#crSubtitle').textContent = cfg.subtitle || '';
  $('#crBody').innerHTML = cfg.entries.map(e => `
    <div class="credit-entry">
      <span class="credit-role">${escapeHtml(e.role)}</span>
      <span class="credit-name">${escapeHtml(e.name)}</span>
    </div>
  `).join('') + (cfg.footer ? `<p class="credit-footer">${escapeHtml(cfg.footer)}</p>` : '');
  show('credits', 1);
}

function renderCreditsFooter() {
  if (!GAME_CONFIG.credits.showFooter) return;
  const names = GAME_CONFIG.credits.entries.map(e => e.name).join(' · ');
  const el = $('#creditFooter');
  if (el) el.textContent = names;
}

/* ---------- Menu utama ---------- */
function toMenu() {
  if (S === 'pause' && MODE === 'classic' && P) submitScore(score | 0);
  S = 'menu';
  ['pause', 'end', 'load', 'gate', 'reg', 'rank', 'prof', 'credits', 'tournamentEnd']
    .forEach(id => show(id, 0));
  show('menu', 1);
  $('#pb').style.display = 'none';
  $('#bI').style.display = 'none';
  $('#tc').style.display = '';
  renderLeaderboardPreview();
  renderCreditsFooter();
  updateStartButtonLabel();
}

function updateStartButtonLabel() {
  const btn = document.querySelector('.b[data-a="classic"]');
  if (btn && typeof Tournament !== 'undefined') {
    btn.textContent = Tournament.getMenuLabel();
  }
}

function endIntro() {
  if (S !== 'intro') return;
  S = 'menu';
  M = [];
  slow = 1;
  $('#sk').style.display = 'none';
  routePlayer();
}

function begin(mode) {
  S = 'load';
  show('menu', 0);
  show('end', 0);
  show('load', 1);
  $('#tip').textContent = TIPS[R() * TIPS.length | 0];
  SFX.door();

  const bar = $('#bar i');
  bar.style.transition = 'none';
  bar.style.width = '0';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 1.6s';
    bar.style.width = '100%';
  });

  setTimeout(() => {
    reset(mode);
    if (mode === 'classic') { playerProfile.gamesPlayed++; savePlayerProfile(); }
    S = 'play';
    show('load', 0);
    $('#pb').style.display = 'block';
    $('#tc').style.display = touch ? 'block' : '';
    last = performance.now();
  }, 1700);
}