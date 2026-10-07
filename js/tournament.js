/*
 * ============================================================
 * TOURNAMENT.JS — SCHEDULE + END-OF-TOURNAMENT SEQUENCE
 * ============================================================
 *
 * Semua waktu mengikuti waktu lokal perangkat untuk versi lokal.
 * Saat pindah ke backend realtime, fungsi timestamp ini dapat
 * diganti server time tanpa menyentuh UI/gameplay.
 * ============================================================
 */

const Tournament = (() => {
  let tickTimer = null;
  let ending = false;
  let warningShown = false;
  let armed = false;

  const config = () => GAME_CONFIG.tournament;

  const pad = value => String(value).padStart(2, '0');

  function todayKey(date = new Date()) {
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-');
  }

  function isConfigured() {
    const cfg = config();

    return Boolean(
      cfg &&
      cfg.enabled !== false &&
      cfg.enabledToday !== false &&
      cfg.endTime !== false &&
      cfg.endTime
    );
  }

  function isTournamentDay() {
    if (!isConfigured()) return false;

    const targetDate = config().date;

    return !targetDate ||
      targetDate === todayKey();
  }

  function parseTime(value) {
    if (value === false || value === null || value === '') {
      return null;
    }

    const match = /^(\d{1,2}):(\d{2})$/.exec(String(value));

    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      hours < 0 || hours > 23 ||
      minutes < 0 || minutes > 59
    ) {
      return null;
    }

    return { hours, minutes };
  }

  function timestampFor(value) {
    const time = parseTime(value);

    if (!time) return Infinity;

    const date = new Date();

    date.setHours(
      time.hours,
      time.minutes,
      0,
      0
    );

    return date.getTime();
  }

  function getStartTimestamp() {
    return timestampFor(config().startTime || '00:00');
  }

  function getEndTimestamp() {
    return timestampFor(config().endTime);
  }

  function getWarningTimestamp() {
    return (
      getEndTimestamp() -
      Number(config().warningMinutes || 1) *
      60 *
      1000
    );
  }

  function isWithinWindow(now = Date.now()) {
    if (!isTournamentDay()) return false;

    return (
      now >= getStartTimestamp() &&
      now < getEndTimestamp()
    );
  }

  function isPastEnd(now = Date.now()) {
    return isTournamentDay() &&
      now >= getEndTimestamp();
  }

  function armIfPlaying() {
    if (isWithinWindow()) {
      armed = true;
      warningShown = false;
    }
  }

  function disarm() {
    armed = false;
    warningShown = false;
  }

  function start() {
    if (tickTimer) return;

    tickTimer = setInterval(tick, 250);
    tick();
  }

  function stop() {
    if (!tickTimer) return;

    clearInterval(tickTimer);
    tickTimer = null;
  }

  function tick() {
    if (ending) return;

    if (!isTournamentDay()) {
      disarm();
      return;
    }

    const now = Date.now();

    /*
     * Pemain bisa mulai sebelum jam start. Begitu masuk
     * jendela turnamen, game otomatis mengaktifkan timer.
     */
    if (
      S === 'play' &&
      !armed &&
      isWithinWindow(now)
    ) {
      armIfPlaying();
    }

    if (!armed) return;

    const endTimestamp = getEndTimestamp();

    if (
      !warningShown &&
      now >= getWarningTimestamp() &&
      now < endTimestamp
    ) {
      warningShown = true;
      showWarning();
    }

    if (now >= endTimestamp) {
      runEndingSequence();
    }
  }

  function showWarning() {
    const element = document.getElementById(
      'tournamentWarning'
    );

    if (!element) return;

    element.textContent = 'SISA WAKTU 1 MENIT';
    element.classList.remove('show');

    void element.offsetWidth;

    element.classList.add('show');

    if (typeof tone === 'function') {
      tone(440, .7, 'square', .2);
      setTimeout(
        () => tone(330, .7, 'square', .18),
        180
      );
    }

    if (typeof say === 'function') {
      say('SISA WAKTU 1 MENIT', 5);
    }
  }

  function runEndingSequence() {
    if (ending) return;

    ending = true;
    stop();

    /*
     * Pastikan skor terakhir masuk sebelum pemenang dibaca.
     */
    if (
      typeof S !== 'undefined' &&
      S === 'play' &&
      typeof submitScore === 'function'
    ) {
      void submitScore(score | 0);
    }

    S = 'tournamentEnd';
    $('#pb').style.display = 'none';
    $('#tc').style.display = 'none';

    showTournamentOverlay();

    runCountdown(
      Number(config().countdownSeconds || 3),
      () => revealWinners(1)
    );
  }

  function runCountdown(seconds, done) {
    const wrap = document.getElementById(
      'tCountdownWrap'
    );
    const element = document.getElementById(
      'tCountdown'
    );
    const title = document.getElementById(
      'tCountdownTitle'
    );

    if (!wrap || !element) {
      done();
      return;
    }

    wrap.style.display = 'flex';

    if (title) {
      title.textContent = 'TURNAMEN SELESAI DALAM';
    }

    let current = Math.max(1, seconds);

    const step = () => {
      if (current <= 0) {
        element.textContent = 'WAKTU HABIS';
        element.classList.remove('show');
        void element.offsetWidth;
        element.classList.add('show');

        if (typeof tone === 'function') {
          tone(110, .7, 'sawtooth', .3);
        }

        setTimeout(() => {
          wrap.style.display = 'none';
          done();
        }, 1000);

        return;
      }

      element.textContent = current;
      element.classList.remove('show');
      void element.offsetWidth;
      element.classList.add('show');

      if (typeof tone === 'function') {
        tone(
          220 + current * 120,
          .35,
          'square',
          .25
        );
      }

      current -= 1;
      setTimeout(step, 1000);
    };

    step();
  }

  function getTopEntries() {
    try {
      return MLDatabase
        .getLeaderboardSync()
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, Number(config().topWinners || 3));
    } catch {
      return [];
    }
  }

  function revealWinners(rank) {
    const entries = getTopEntries();

    if (
      rank > Number(config().topWinners || 3) ||
      rank > entries.length
    ) {
      setTimeout(finish, 1500);
      return;
    }

    const entry = entries[rank - 1];
    const character =
      CHARACTER_CLASSES[entry.characterIndex];

    const element = document.getElementById('tWinner');

    if (!element) {
      finish();
      return;
    }

    element.innerHTML = `
      <div class="t-rank">PEMENANG NO ${rank}</div>
      <div class="t-name">${escapeHtmlSafe(entry.name)}</div>
      <div class="t-score">
        ${Number(entry.score || 0)} POIN
        ${character ? character.emoji : ''}
      </div>
    `;

    element.classList.remove('show');
    void element.offsetWidth;
    element.classList.add('show');

    playFanfare(rank);

    setTimeout(
      () => revealWinners(rank + 1),
      Number(config().revealDelayMs || 2400)
    );
  }

  function playFanfare(rank) {
    if (typeof tone !== 'function') return;

    const notes =
      rank === 1
        ? [523, 659, 784, 1046, 1318]
        : rank === 2
          ? [392, 523, 659]
          : [349, 440, 523];

    notes.forEach(
      (frequency, index) => tone(
        frequency,
        .6,
        'triangle',
        .22,
        0,
        index * .1
      )
    );
  }

  function showTournamentOverlay() {
    const overlay = document.getElementById(
      'tournamentEnd'
    );

    if (!overlay) return;

    overlay.classList.remove('hide');

    const countdown =
      document.getElementById('tCountdownWrap');

    const winner =
      document.getElementById('tWinner');

    if (countdown) countdown.style.display = 'flex';
    if (winner) winner.innerHTML = '';
  }

  function finish() {
    const overlay = document.getElementById(
      'tournamentEnd'
    );

    if (overlay) {
      overlay.classList.add('hide');
    }

    const warning =
      document.getElementById('tournamentWarning');

    if (warning) {
      warning.classList.remove('show');
    }

    ending = false;
    armed = false;
    warningShown = false;

    if (
      config().redirectToLeaderboard &&
      typeof openRanking === 'function'
    ) {
      openRanking();
    } else if (typeof toMenu === 'function') {
      toMenu();
    }
  }

  function getMenuLabel() {
    if (!isConfigured()) return 'START';
    if (isPastEnd()) return 'START';
    return 'TURNAMEN';
  }

  function getStatusText() {
    if (!isConfigured()) {
      return 'Hari ini bukan hari turnamen.';
    }

    if (isPastEnd()) {
      return 'Turnamen hari ini telah selesai.';
    }

    if (Date.now() < getStartTimestamp()) {
      return `Turnamen dimulai pukul ${config().startTime}.`;
    }

    if (isWithinWindow()) {
      const remaining = Math.max(
        0,
        Math.ceil((getEndTimestamp() - Date.now()) / 1000)
      );

      return `Turnamen aktif · ${remaining}s`;
    }

    return `Berakhir pukul ${config().endTime}.`;
  }

  function escapeHtmlSafe(value) {
    return String(value).replace(
      /[&<>"]/g,
      character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character])
    );
  }

  return Object.freeze({
    start,
    stop,
    tick,
    armIfPlaying,
    disarm,
    isTournamentDay,
    isWithinWindow,
    isPastEnd,
    isActive: () => armed && isWithinWindow(),
    getStartTimestamp,
    getEndTimestamp,
    getMenuLabel,
    getStatusText
  });
})();
