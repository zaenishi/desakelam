/*
 * ============================================================
 * UI.JS — MENU, NAVIGATION, BUTTON EVENTS
 * ============================================================
 */

document.addEventListener('click', event => {
  const characterButton =
    event.target.closest('.chc');

  if (characterButton) {
    SFX.click();
    selectCharacter(
      Number(characterButton.dataset.i)
    );
    return;
  }

  const button = event.target.closest('.b');

  if (!button) return;

  SFX.click();

  const ripple = document.createElement('i');
  const rect = button.getBoundingClientRect();

  ripple.className = 'rp';
  ripple.style.left =
    `${event.clientX - rect.left - 5}px`;
  ripple.style.top =
    `${event.clientY - rect.top - 5}px`;

  button.appendChild(ripple);

  setTimeout(
    () => ripple.remove(),
    600
  );

  const action = button.dataset.a;

  if (action === 'train') begin('train');
  if (action === 'classic') begin('classic');
  if (action === 'again') begin(MODE === 'train' ? 'train' : 'classic');
  if (action === 'home') toMenu();
  if (action === 'resume') pauseT();
  if (action === 'rank') openRanking();
  if (action === 'prof') openProfile();
  if (action === 'credits') openCredits();
  if (action === 'fullscreen') requestGameFullscreen();
  if (action === 'close') toMenu();
  if (action === 'gate') submitAccessCode();
  if (action === 'reg') submitRegistration();
  if (action === 'edit') showRegistration();
});

document.addEventListener('pointerover', event => {
  if (
    event.target.closest &&
    event.target.closest('.b')
  ) {
    SFX.hover();
  }
});

const show = (id, visible) => {
  const element = document.getElementById(id);

  if (!element) return;

  element.classList.toggle(
    'hide',
    !visible
  );
};

function renderLB() {
  const character = getCurrentCharacterClass();

  /*
   * BUG FIX:
   * sebelumnya menggunakan c.n, padahal property yang benar
   * adalah character.name. Inilah penyebab [UNDEFINED].
   */
  $('#mi').textContent = playerProfile.name
    ? `${playerProfile.name} - ${playerProfile.uid} [${character.name}]`
    : '';

  $('#lb').innerHTML = playerProfile.name
    ? `Skor terbaik <b style="color:#ffd700">${
        playerProfile.bestScore
      }</b> · Rank #${getPlayerRank(
        playerProfile.bestScore
      )}`
    : '';

  const tournamentButton =
    document.querySelector('[data-a="classic"]');

  if (tournamentButton) {
    tournamentButton.textContent =
      Tournament.getMenuLabel();
  }

  const tournamentStatus =
    document.getElementById('tournamentStatus');

  if (tournamentStatus) {
    tournamentStatus.textContent =
      Tournament.getStatusText();
  }
}

function hideAllOverlays() {
  [
    'menu',
    'end',
    'load',
    'gate',
    'reg',
    'rank',
    'prof',
    'credits',
    'pause',
    'tournamentEnd'
  ].forEach(id => show(id, 0));
}

function toMenu() {
  if (
    S === 'pause' &&
    MODE === 'classic' &&
    P &&
    playerProfile.uid
  ) {
    void submitScore(score | 0);
  }

  if (typeof Tournament !== 'undefined') {
    Tournament.disarm();
  }

  S = 'menu';

  hideAllOverlays();
  show('menu', 1);

  $('#pb').style.display = 'none';
  $('#bI').style.display = 'none';
  $('#tc').style.display = '';

  renderLB();
}

function pauseT() {
  if (S === 'play') {
    S = 'pause';
    show('pause', 1);
    SFX.back();
    return;
  }

  if (S === 'pause') {
    S = 'play';
    show('pause', 0);
    SFX.click();
  }
}

$('#pb').onclick = pauseT;

$('#sk').onclick = () => {
  if (S === 'intro') {
    endIntro();
  }
};

function begin(mode) {
  /*
   * Jangan mulai ulang login/profile.
   * Profile sudah valid, jadi langsung ke loading.
   */
  if (!isProfileComplete()) {
    routePlayer();
    return;
  }

  S = 'load';

  hideAllOverlays();
  show('load', 1);

  $('#tip').textContent =
    TIPS[R() * TIPS.length | 0];

  SFX.door();

  const bar =
    document.querySelector('#bar i');

  bar.style.transition = 'none';
  bar.style.width = '0';

  requestAnimationFrame(() => {
    bar.style.transition = 'width 1.6s';
    bar.style.width = '100%';
  });

  setTimeout(() => {
    reset(mode);

    if (mode === 'classic') {
      playerProfile.gamesPlayed += 1;
      savePlayerProfile();
    }

    /*
     * Arm turnamen hanya jika game benar-benar dimulai
     * pada window turnamen. Jika mulai sebelum start, module
     * tournament akan otomatis arm saat jam mulai.
     */
    if (
      mode === 'classic' &&
      typeof Tournament !== 'undefined'
    ) {
      Tournament.armIfPlaying();
    }

    S = 'play';

    show('load', 0);

    $('#pb').style.display = 'block';
    $('#tc').style.display =
      touch ? 'block' : '';

    last = performance.now();
  }, 1700);
}
