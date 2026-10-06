/*
 * ============================================================
 * TOURNAMENT.JS — Turnamen berbasis jam
 * ============================================================
 * Konfigurasi: GAME_CONFIG.tournament
 *
 * Alur:
 *   - Sebelum `endTime`, gameplay seperti biasa (turnamen).
 *   - `warningMinutes` sebelum `endTime` → notifikasi sisa waktu.
 *   - Saat `endTime` tiba → hitung mundur 3,2,1 → reveal juara.
 * ============================================================
 */

const Tournament = (() => {
  let tickTimer = null;
  let ending = false;
  let warningShown = false;

  /* ---------- Helpers ---------- */
  const cfg = () => GAME_CONFIG.tournament;

  function pad(n) { return String(n).padStart(2, '0'); }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function isTournamentDay() {
    if (!cfg().enabled) return false;
    const target = cfg().date || todayKey();
    return target === todayKey();
  }

  function parseHHMM(str) {
    const [h, m] = String(str).split(':').map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return { h, m };
  }

  function timestampFor(str) {
    const t = parseHHMM(str);
    if (!t) return Infinity;
    const d = new Date();
    d.setHours(t.h, t.m, 0, 0);
    return d.getTime();
  }

  const endTimestamp     = () => timestampFor(cfg().endTime);
  const startTimestamp   = () => timestampFor(cfg().startTime);
  const warningTimestamp = () =>
    endTimestamp() - (cfg().warningMinutes * 60 * 1000);

  function isActive() {
    if (!isTournamentDay()) return false;
    const now = Date.now();
    return now >= startTimestamp() && now < endTimestamp();
  }

  /* ---------- Timer loop ---------- */
  function start() {
    if (tickTimer) return;
    tickTimer = setInterval(tick, 1000);
    tick();
  }

  function tick() {
    if (!isTournamentDay() || ending) return;
    const now = Date.now();

    /* 1) Warning */
    if (!warningShown && now >= warningTimestamp() && now < endTimestamp()) {
      warningShown = true;
      const secsLeft = Math.max(0, Math.ceil((endTimestamp() - now) / 1000));
      if (typeof say === 'function')
        say(`⚠ Turnamen berakhir dalam ${secsLeft} detik!`, 6);
      if (typeof tone === 'function') tone(440, 0.5, 'square', 0.15);
    }

    /* 2) Trigger ending */
    if (now >= endTimestamp()) {
      runEndingSequence();
    }
  }

  /* ---------- Ending sequence ---------- */
  function runEndingSequence() {
    if (ending) return;
    ending = true;
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }

    /* Pastikan skor pemain tersimpan sebelum reveal */
    try {
      if (typeof S !== 'undefined' && S === 'play' && typeof submitScore === 'function')
        submitScore(score | 0);
    } catch { /* abaikan */ }

    showTournamentOverlay();
    runCountdown(cfg().countdownSeconds, () => revealWinners(1));
  }

  function runCountdown(n, done) {
    const el = document.getElementById('tCountdown');
    const wrap = document.getElementById('tCountdownWrap');
    if (!wrap || !el) return done();

    wrap.style.display = 'block';
    let current = n;
    const iv = setInterval(() => {
      if (current <= 0) {
        clearInterval(iv);
        el.textContent = '';
        wrap.style.display = 'none';
        done();
        return;
      }
      el.textContent = current;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'countPulse 0.9s ease-out';
      if (typeof tone === 'function') tone(220 + current * 120, 0.25, 'square', 0.25);
      current--;
    }, 1000);
  }

  function getTopEntries() {
    try {
      return MLDatabase.getLeaderboardSync()
        .slice()
        .sort((a, b) => (+b.score || 0) - (+a.score || 0))
        .slice(0, cfg().topWinners);
    } catch { return []; }
  }

  function revealWinners(rank) {
    const entries = getTopEntries();

    if (rank > cfg().topWinners || rank > entries.length) {
      setTimeout(finish, 1500);
      return;
    }

    const entry = entries[rank - 1];
    const char  = (typeof CHARACTER_CLASSES !== 'undefined')
                ? CHARACTER_CLASSES[entry.characterIndex] : null;

    const el = document.getElementById('tWinner');
    el.innerHTML = `
      <div class="t-rank">PEMENANG KE-${rank}</div>
      <div class="t-name">${escapeHtmlSafe(entry.name)}</div>
      <div class="t-score">${entry.score} poin ${char ? char.emoji : ''}</div>
    `;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    /* Backsound dramatis */
    playFanfare(rank);

    setTimeout(() => revealWinners(rank + 1), cfg().revealDelayMs);
  }

  function playFanfare(rank) {
    if (typeof tone !== 'function') return;
    const chords = rank === 1
      ? [523, 659, 784, 1046, 1318]
      : rank === 2 ? [392, 523, 659] : [349, 440, 523];
    chords.forEach((f, i) => tone(f, 0.6, 'triangle', 0.22, 0, i * 0.1));
  }

  function showTournamentOverlay() {
    const ov = document.getElementById('tournamentEnd');
    if (!ov) return;
    ov.classList.remove('hide');
    document.getElementById('tWinner').innerHTML = '';
  }

  function finish() {
    const ov = document.getElementById('tournamentEnd');
    if (ov) ov.classList.add('hide');
    ending = false;
    if (cfg().redirectToLeaderboard && typeof openRanking === 'function') {
      openRanking();
    } else if (typeof toMenu === 'function') {
      toMenu();
    }
  }

  /* ---------- Label untuk menu ---------- */
  function getMenuLabel() {
    if (isTournamentDay()) return 'TURNAMEN';
    return 'MULAI';
  }

  function escapeHtmlSafe(v) {
    return String(v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  return Object.freeze({
    start,
    isActive,
    isTournamentDay,
    getMenuLabel,
    endTimestamp,
    startTimestamp
  });
})();