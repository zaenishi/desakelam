/* ===== UI ===== */
document.addEventListener('click', e => {
  const cc = e.target.closest('.chc'); if (cc) {
    SFX.click(); selectCharacter(+ cc.dataset.i); return
  }
  const b = e.target.closest('.b'); if (!b)return; SFX.click(); const r = document.createElement('i'),
  q = b.getBoundingClientRect(); r.className = 'rp'; r.style.left = e.clientX - q.left - 5 + 'px'; r.style.top = e.clientY - q.top - 5 + 'px'; b.appendChild(r); setTimeout(() => r.remove(),
  600); const a = b.dataset.a; if (a == 'train' || a == 'classic')begin(a); if (a == 'again')begin(MODE); if (a == 'home')toMenu(); if (a == 'resume')pauseT(); if (a == 'rank')openRanking(); if (a == 'prof')openProfile(); if (a == 'close')toMenu(); if (a == 'credits')openCredits(); if (a == 'gate')submitAccessCode(); if (a == 'reg')submitRegistration(); if (a == 'edit')showRegistration()
});
document.addEventListener('pointerover', e => {
  if (e.target.closest && e.target.closest('.b'))SFX.hover()
});
const show = (id, v) => querySelector('#' + id).classList.toggle('hide', !v);
function pauseT() {
  if (gameState == 'play') {
    gameState = 'pause';
    show('pause',
    1);
    SFX.back()
  } else if (gameState == 'pause') {
    gameState = 'play';
    show('pause',
    0)
  }
}
querySelector('#pb').onclick = pauseT;
querySelector('#sk').onclick = () => {
  if (gameState == 'intro')endIntro()
};
function renderLB() {
  const c = getCurrentCharacterClass();
  querySelector('#mi').textContent = playerProfile.name ? `${escapeHtml(playerProfile.name)} - ${escapeHtml(playerProfile.uid)} [${escapeHtml(c.name)}]`: '';
  querySelector('#lb').innerHTML = playerProfile.name ? `Skor terbaik <b style="color:#ffd700">${playerProfile.bestScore}</b> · Rank #${getPlayerRank(playerProfile.bestScore)}` + (playerProfile.skinUnlocked ? ' · Skin emas': ''): ''
};
if (typeof Tournament !== 'undefined') {
  const b = querySelector('#tournamentBtn');
  if (b)b.textContent = Tournament.getMenuLabel();
  const st = querySelector('#tournamentStatus');
  if (st)st.textContent = Tournament.getStatusText()
}
function toMenu() {
  if (gameState == 'pause' && MODE == 'classic' && player)submitScore(score | 0);
  gameState = 'menu';
  ['pause',
  'end',
  'load',
  'gate',
  'reg',
  'rank',
  'prof'].forEach(i => show(i,
  0));
  show('menu',
  1);
  querySelector('#pb').style.display = 'none';
  querySelector('#bI').style.display = 'none';
  querySelector('#tc').style.display = '';
  renderLB()
}
function endIntro() {
  if (gameState != 'intro')return;
  gameState = 'menu';
  monsters = [];
  timeScale = 1;
  querySelector('#sk').style.display = 'none';
  routePlayer()
}
function begin(m) {
  gameState = 'load';
  show('menu',
  0);
  show('end',
  0);
  show('load',
  1);
  querySelector('#tip').textContent = TIPS[random() * TIPS.length | 0];
  SFX.door();
  const bar = querySelector('#bar i');
  bar.style.transition = 'none';
  bar.style.width = '0';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 1.6s'; bar.style.width = '100%'
  });
  setTimeout(() => {
    reset(m); if (m == 'classic') {
      playerProfile.gamesPlayed++; savePlayerProfile()
    }
    gameState = 'play'; show('load',
    0); querySelector('#pb').style.display = 'block'; querySelector('#tc').style.display = isTouchDevice ? 'block': ''; lastTimestamp = performance.now()
  },
  1700)
}
function openCredits() {
  show('menu',
  0);
  querySelector('#creditsNames').innerHTML = (GAME_CONFIG.ui.credits || []).map(escapeHtml).map(n => `<div>${n}</div>`).join('');
  show('credits',
  1)
}
function closeCredits() {
  show('credits',
  0);
  show('menu',
  1);
  gameState = 'menu';
  renderLB()
}
const creditsCloseButton = document.querySelector('#credits [data-a="close"]');
if (creditsCloseButton) creditsCloseButton.addEventListener('click', e => {
  e.preventDefault(); e.stopPropagation(); closeCredits()
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !querySelector('#credits').classList.contains('hide')) closeCredits()
});
