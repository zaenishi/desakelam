/*
 * ============================================================
 * TOURNAMENT.JS — Turnamen berbasis jam (REVISI)
 * ============================================================
 * Perbaikan:
 *  - Turnamen HANYA trigger kalau pemain benar-benar bermain
 *    selama jendela turnamen (armed).
 *  - Buka game setelah endTime → tidak ada hitung mundur.
 *  - Timer tetap berjalan tapi tidak efek apapun sampai armed.
 * ============================================================
 */

const Tournament = (() => {
  let tickTimer = null;
  let ending = false;
  let warningShown = false;
  let armed = false;    // true = pemain sudah mulai main di jendela turnamen

  const cfg = () => GAME_CONFIG.tournament;
  const pad = n => String(n).padStart(2, '0');

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function isTournamentDay() {
    if (!cfg().enabled) return false;
    const target = cfg().date || todayKey();
    return target === todayKey();
  }

  function parseHHMM(s) {
    const [h, m] = String(s).split(':').map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? { h, m } : null;
  }

  function timestampFor(s) {
    const t = parseHHMM(s);
    if (!t) return Infinity;
    const d = new Date();
    d.setHours(t.h, t.m, 0, 0);
    return d.getTime();
  }

  const startTimestamp   = () => timestampFor(cfg().startTime);
  const endTimestamp     = () => timestampFor(cfg().endTime);
  const warningTimestamp = () =>
    endTimestamp() - cfg().warningMinutes * 60 * 1000;

  /* ------------------------------------------------------------
   * Dipanggil dari ui.js → begin() saat pemain masuk gameplay.
   * Jika saat itu masih dalam jendela turnamen, arm turnamen.
   * ------------------------------------------------------------ */
  function armIfPlaying() {
    if (!isTournamentDay()) return;
    const now = Date.now();
    if (now >= startTimestamp() && now < endTimestamp()) {
      armed = true;
      warningShown = false;
      console.log('[Tournament] armed — pemain masuk dalam jendela turnamen');
    }
  }

  function start() {
    if (tickTimer) return;
    tickTimer = setInterval(tick, 1000);
  }

  function tick() {
    if (ending || !armed) return;             // <— KUNCI: skip kalau belum armed
    if (!isTournamentDay()) return;

    const now = Date.now();
    const endTs = endTimestamp();

    /* Warning H-1 menit */
    if (!warningShown && now >= warningTimestamp() && now < endTs) {
      warningShown = true;
      const secs = Math.max(0, Math.ceil((endTs - now) / 1000));
      if (typeof say === 'function') say(`⚠ Turnamen berakhir dalam ${secs} detik!`, 6);
      if (typeof tone === 'function') tone(440, .5, 'square', .15);
    }

    /* Trigger reveal */
    if (now >= endTs) runEndingSequence();
  }

  function runEndingSequence() {
    if (ending) return;
    ending = true;
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }

    try {
      if (typeof S !== 'undefined' && S === 'play' && typeof submitScore === 'function')
        submitScore(score | 0);
    } catch {}

    showTournamentOverlay();
    runCountdown(cfg().countdownSeconds, () => revealWinners(1));
  }

  function runCountdown(n, done) {
    const wrap = document.getElementById('tCountdownWrap');
    const el   = document.getElementById('tCountdown');
    if (!wrap || !el) return done();

    wrap.style.display = 'block';
    let cur = n;
    const iv = setInterval(() => {
      if (cur <= 0) {
        clearInterval(iv);
        el.textContent = '';
        wrap.style.display = 'none';
        done();
        return;
      }
      el.textContent = cur;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'countPulse .9s ease-out';
      if (typeof tone === 'function') tone(220 + cur * 120, .25, 'square', .25);
      cur--;
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
    const char  = typeof CHARACTER_CLASSES !== 'undefined'
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

    playFanfare(rank);
    setTimeout(() => revealWinners(rank + 1), cfg().revealDelayMs);
  }

  function playFanfare(rank) {
    if (typeof tone !== 'function') return;
    const chords = rank === 1 ? [523, 659, 784, 1046, 1318]
                 : rank === 2 ? [392, 523, 659]
                 : [349, 440, 523];
    chords.forEach((f, i) => tone(f, .6, 'triangle', .22, 0, i * .1));
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
    armed = false;
    if (cfg().redirectToLeaderboard && typeof openRanking === 'function')
      openRanking();
    else if (typeof toMenu === 'function')
      toMenu();
  }

  function getMenuLabel() {
    return isTournamentDay() ? 'TURNAMEN' : 'MULAI';
  }

  function escapeHtmlSafe(v) {
    return String(v).replace(/[&<>"]/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  return Object.freeze({
    start, armIfPlaying, isTournamentDay, getMenuLabel,
    endTimestamp, startTimestamp,
    isActive: () => armed && Date.now() < endTimestamp()
  });
})();