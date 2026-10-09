/*
 * ============================================================
 * TOURNAMENT.JS — LOGIKA TURNAMEN
 * ============================================================
 * Fase:  off | waiting | running | ended
 * Urutan akhir turnamen (jika pemain ikut):
 *   10 detik terakhir (hitung mundur) -> GONG + "TURNAMEN HABIS!" -> pengumuman juara
 *   -> sinematik "Desa Kelam menjadi cerah" -> halaman leaderboard pemenang -> reset sesi
 * Semua timer urutan akhir hidup di Scope layar TOURNAMENT_END_STATE,
 * sehingga otomatis dibuang saat pindah layar (tidak menumpuk).
 */
const Tournament = (() => {
  const KEY = 'ml_tournament_v2';
  let st = { tid: '', joined: false, startedAt: 0, doneTid: '', lastTid: '', pendingReset: false, popupPending: false };
  let timer = 0, warned = '', lastSec = -1, started = false;
  const cfg = () => GAME_CONFIG.tournament || {};
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function load() { try { Object.assign(st, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function parseHM(v) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || '')); if (!m) return null;
    const h = +m[1], mi = +m[2]; return h > 23 || mi > 59 ? null : { h, mi };
  }
  function atToday(hm) { const d = new Date(); d.setHours(hm.h, hm.mi, 0, 0); return d.getTime(); }

  /* Jendela turnamen saat ini -> {start,end,tid} atau null bila konfigurasi tidak valid. */
  function win() {
    const c = cfg(); if (!c.active) return null;
    if (c.mode === 'date') {
      const end = Date.parse(c.targetDate); if (!Number.isFinite(end)) return null;
      return { start: 0, end, tid: 'date:' + c.targetDate };
    }
    if (c.mode === 'session') {
      const dur = Math.max(.1, +c.durationMinutes || 10) * 60000;
      if (!st.startedAt) return { start: Infinity, end: Infinity, tid: 'session:pending', dur };
      return { start: st.startedAt, end: st.startedAt + dur, tid: 'session:' + st.startedAt, dur };
    }
    const a = parseHM(c.startTime), b = parseHM(c.endTime); if (!a || !b) return null;
    const start = atToday(a), end = atToday(b); if (end <= start) return null;
    return { start, end, tid: `time:${ymd(new Date())}:${c.startTime}-${c.endTime}`, dur: end - start };
  }
  function phase(now = Date.now()) {
    const w = win(); if (!w) return 'off';
    if (st.doneTid === w.tid) return 'ended';
    if (now < w.start) return 'waiting';
    if (now >= w.end) return 'ended';
    return 'running';
  }
  function remaining(now = Date.now()) { const w = win(); return w && Number.isFinite(w.end) ? Math.max(0, w.end - now) : 0; }
  function fmt(ms) {
    const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return h ? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`;
  }

  /* ---------- dipanggil saat tombol START ditekan ---------- */
  function onStart() {
    const c = cfg(); if (!c.active) return false;
    if (c.mode === 'session' && phase() === 'waiting' && !st.startedAt) { st.startedAt = Date.now(); save(); }
    const w = win();
    if (phase() !== 'running' || !w) return false;
    if (st.tid !== w.tid) { st.tid = w.tid; st.joined = false; }
    if (!st.joined) { st.joined = true; st.popupPending = true; st.lastTid = w.tid; save(); }
    MLDatabase.watchTournament(w.tid); /* skor tampil real-time bila Firebase aktif */
    renderHud();
    return true;
  }
  /* Pop-up "MODE TURNAMEN DIMULAI!" -> tampil sekali, saat gameplay benar-benar mulai. */
  function flushPopup() {
    if (!st.popupPending || phase() !== 'running') return;
    st.popupPending = false; save();
    const el = $('#tPop'); if (!el) return;
    $('#tPopTime').textContent = fmt(remaining());
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    try { SFX.fanfare(); } catch (e) {}
    clearTimeout(flushPopup.tm);
    flushPopup.tm = setTimeout(() => el.classList.remove('show'), 4800);
  }

  const isJoined = () => st.joined && phase() === 'running';
  const currentTid = () => st.tid;
  /* Skor diterima selama turnamen berjalan, atau selama urutan penutup (pemain sudah join). */
  const acceptsScore = () => !!(st.joined && st.tid && (phase() === 'running' || st.pendingReset));
  const isLeaderboardLocked = () => cfg().lockLeaderboard !== false && phase() === 'running';
  const lastTid = () => st.lastTid;
  const isActive = () => !!cfg().active && phase() !== 'off';

  function getWinners(tid = st.lastTid) {
    const n = Math.max(1, +cfg().topWinners || 3);
    return MLDatabase.getTournamentBoardSync(tid).slice(0, n).map((e, i) => Object.assign({ rank: i + 1 }, e));
  }

  /* ---------- HUD (menu label, bar atas, warning, hitung mundur) ---------- */
  function startSubText() {
    const c = cfg(); if (!c.active) return '';
    const p = phase();
    if (p === 'running') return `Turnamen Mode - Sisa ${fmt(remaining())}`;
    if (p === 'waiting') return c.mode === 'session' ? `Turnamen Mode - Durasi ${c.durationMinutes} menit` : `Turnamen Mode - Mulai ${c.startTime}`;
    if (p === 'ended') return 'Turnamen Mode - Selesai';
    return '';
  }
  let lastSub = '', lastBar = '';
  function renderHud() {
    const p = phase(), rem = remaining(), ui = UI.state;
    const sub = startSubText(), el = $('#startSub');
    if (el && sub !== lastSub) { el.textContent = sub; el.hidden = !sub; lastSub = sub; }
    const bar = $('#tBar');
    const showBar = p === 'running' && st.joined && ![INTRO_STATE, CINEMATIC_STATE, TOURNAMENT_END_STATE, null, undefined].includes(ui);
    if (bar) {
      const txt = `⏱ TURNAMEN · ${fmt(rem)}`;
      if (showBar && txt !== lastBar) { bar.textContent = txt; lastBar = txt; }
      bar.classList.toggle('show', showBar);
      const warn = showBar && rem <= (+cfg().warningMinutes || 1) * 60000;
      bar.classList.toggle('warn', warn);
      document.body.classList.toggle('t-warn', warn);
    }
    /* hitung mundur dramatis */
    const fin = $('#tFinal'), fs = Math.max(1, +cfg().finalCountdownSeconds || 10);
    if (fin) {
      const inFinal = p === 'running' && st.joined && rem > 0 && rem <= fs * 1000 && showBar;
      if (inFinal) {
        const sec = Math.ceil(rem / 1000);
        if (sec !== lastSec) {
          lastSec = sec; fin.textContent = sec; fin.classList.remove('pop'); void fin.offsetWidth; fin.classList.add('pop');
          try { sec <= 3 ? SFX.tickLow() : SFX.tick(); } catch (e) {}
        }
        fin.classList.add('show');
      } else { fin.classList.remove('show'); lastSec = -1; }
    }
  }
  function warnOnce() {
    const w = win(); if (!w || warned === w.tid) return;
    warned = w.tid;
    const el = $('#tournamentWarning'); if (!el) return;
    el.textContent = `SISA WAKTU ${+cfg().warningMinutes || 1} MENIT!`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    try { tone(440, .5, 'square', .2); setTimeout(() => tone(330, .5, 'square', .18), 180); } catch (e) {}
  }

  function tick() {
    const w = win(), p = phase();
    if (w && st.tid && st.tid !== w.tid && w.tid !== 'session:pending') { st.joined = false; st.tid = ''; save(); }
    if (p === 'running' && st.joined && remaining() <= (+cfg().warningMinutes || 1) * 60000) warnOnce();
    renderHud();
    if (p === 'ended' && st.joined && st.tid && !st.pendingReset && st.doneTid !== st.tid) beginEnd();
  }

  /* ---------- URUTAN AKHIR ---------- */
  function beginEnd() {
    if (st.pendingReset) return;
    const tid = st.tid;
    try { if (P && MODE === 'classic' && (S === 'play' || S === 'pause')) submitScore(score | 0); } catch (e) {}
    st.doneTid = tid; st.lastTid = tid; st.pendingReset = true; save();
    $('#tournamentWarning') && $('#tournamentWarning').classList.remove('show');
    UI.set(TOURNAMENT_END_STATE, { tid });
  }

  function showEndScreen(scope, tid) {
    const habis = $('#tHabis'), card = $('#tWinCard'), list = $('#tWinners');
    habis.classList.remove('top'); habis.classList.add('big'); card.classList.remove('show'); list.innerHTML = '';
    try { SFX.gong(); } catch (e) {}
    scope.timeout(() => { try { SFX.gong(); } catch (e) {} }, 1300);
    const gap = +cfg().winnerRevealMs || 2400;
    let dead = false, timeUp = false, synced = false, revealed = false;
    scope.add(() => { dead = true; });

    function reveal() {
      const winners = getWinners(tid); /* dibaca SETELAH sinkron server agar skor semua perangkat ikut */
      habis.classList.remove('big'); habis.classList.add('top'); card.classList.add('show');
      if (!winners.length) list.innerHTML = '<div class="no-win">Belum ada skor tercatat.</div>';
      winners.slice().reverse().forEach((wn, i) => scope.timeout(() => { /* dari juara 3 -> 1 */
        const medal = ['🥇', '🥈', '🥉'][wn.rank - 1] || wn.rank;
        const cc = CHARACTER_CLASSES[wn.characterIndex] || CHARACTER_CLASSES[0];
        const row = document.createElement('div');
        row.className = 'win-row r' + wn.rank;
        row.innerHTML = `<span class="medal">${medal}</span><span class="wn"><b>${escapeHtml(wn.name)}</b><small>ID ${escapeHtml(wn.uid)} · ${escapeHtml(cc.name)}</small></span><span class="ws">${wn.score}</span>`;
        list.prepend(row);
        try { wn.rank === 1 ? SFX.fanfare() : SFX.chime(); } catch (e) {}
      }, 400 + i * gap));
      scope.timeout(() => Cinematic.play(() => UI.set(LEADERBOARD_STATE, { mode: 'winners', tid })), 400 + winners.length * gap + 3200);
    }
    /* Pengumuman menunggu 2 hal: animasi "TURNAMEN HABIS!" selesai + data server terbaru (maks 4 dtk). */
    const tryReveal = () => { if (dead || revealed || !timeUp || !synced) return; revealed = true; reveal(); };
    scope.timeout(() => { timeUp = true; tryReveal(); }, 3200);
    MLDatabase.syncTournament(tid, 4000).then(() => { synced = true; tryReveal(); });
  }

  /* Reset sesi untuk turnamen berikutnya. */
  function finishSession() {
    st.joined = false; st.popupPending = false; st.pendingReset = false; st.tid = '';
    if (cfg().mode === 'session') st.startedAt = 0;
    save();
    if (typeof playerProfile !== 'undefined' && playerProfile.charLocked) unlockCharacter();
    try { reset('classic'); newRun(); } catch (e) {}
    lastSub = ''; lastBar = '';
    renderHud();
  }

  function init() {
    if (started) return; started = true;
    load();
    if (st.pendingReset) finishSession(); /* reload di tengah urutan akhir -> bersihkan state */
    if (st.joined && st.tid && phase() === 'running') MLDatabase.watchTournament(st.tid);
    timer = setInterval(tick, 250); tick();
  }
  function dispose() { clearInterval(timer); timer = 0; started = false; }

  return Object.freeze({
    init, dispose, tick, phase, remaining, fmt, onStart, flushPopup, isJoined, currentTid, acceptsScore,
    isLeaderboardLocked, isActive, lastTid, getWinners, finishSession, showEndScreen, renderHud,
    get joined() { return st.joined; }
  });
})();
