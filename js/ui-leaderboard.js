/*
 * ============================================================
 * UI-LEADERBOARD.JS — LEADERBOARD_STATE
 *  mode 'general' : peringkat umum (+ tab turnamen terakhir)
 *  mode 'winners' : halaman khusus pemenang turnamen (sorotan Juara 1-3)
 * ============================================================
 */
const Leaderboard = (() => {
  function row(e, i, me) {
    const cc = CHARACTER_CLASSES[e.characterIndex] || CHARACTER_CLASSES[0];
    return `<div class="rw ${e.uid === me ? 'me' : ''}"><span>${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'}</span><span>${escapeHtml(e.name)} <small>${escapeHtml(e.uid)}</small></span><span>${cc.emoji}</span><span>${e.score}</span></div>`;
  }
  function list(entries, from = 0) {
    $('#rl').innerHTML = entries.length ? entries.map((e, i) => row(e, i + from, playerProfile.uid)).join('') : '<div class="rw">Belum ada skor. Jadilah yang pertama!</div>';
  }
  function podium(top) {
    const el = $('#podium'); el.innerHTML = '';
    el.hidden = !top.length;
    if (!top.length) return;
    const order = [top[1], top[0], top[2]].filter(Boolean);
    order.forEach(w => {
      const col = document.createElement('div'); col.className = 'pod p' + w.rank;
      const cc = CHARACTER_CLASSES[w.characterIndex] || CHARACTER_CLASSES[0];
      col.innerHTML = `${w.rank === 1 ? '<div class="crown">👑</div>' : ''}<canvas width="64" height="64"></canvas><b class="pn">${escapeHtml(w.name)}</b><small>ID ${escapeHtml(w.uid)}</small><div class="pstep"><span class="pm">${['🥇', '🥈', '🥉'][w.rank - 1]}</span><span class="ps">${w.score}</span></div>`;
      el.appendChild(col);
      Sprites.icon(col.querySelector('canvas'), cc.id);
    });
  }
  function showGeneral() {
    $('#rankTitle').textContent = 'RANKING'; $('#podium').hidden = true;
    $('#rs').textContent = 'Database lokal — IndexedDB + cache browser';
    list(getLeaderboardEntries().slice().sort((a, b) => b.score - a.score).slice(0, GAME_CONFIG.leaderboard.displayEntries));
  }
  function showTournament(tid) {
    $('#rankTitle').textContent = '🏆 TURNAMEN';
    $('#rs').textContent = 'Skor dihitung hanya selama turnamen berlangsung';
    const board = MLDatabase.getTournamentBoardSync(tid), n = Math.max(1, +GAME_CONFIG.tournament.topWinners || 3);
    podium(board.slice(0, n).map((e, i) => Object.assign({ rank: i + 1 }, e)));
    list(board.slice(n), n);
    if (!board.length) $('#rl').innerHTML = '<div class="rw">Belum ada skor turnamen.</div>';
  }
  return { showGeneral, showTournament };
})();

UI.register(LEADERBOARD_STATE, {
  enter(scope, p) {
    const mode = p.mode || 'general', tabs = $('#rankTabs');
    let view = 'general';
    if (mode === 'general' && Tournament.isLeaderboardLocked()) { toast('🔒 Leaderboard terkunci selama turnamen!', 'bad'); UI.set(MENU_STATE); return; }
    tabs.innerHTML = '';
    const tid = p.tid || Tournament.lastTid();
    $('#rankClose').textContent = mode === 'winners' ? 'SELESAI' : 'TUTUP';
    if (mode === 'winners') {
      $('#rs').textContent = '';
      Leaderboard.showTournament(tid); SFX.fanfare();
      scope.add(Events.on('tboard', id => { if (id === tid) Leaderboard.showTournament(tid); }));
      return;
    }
    const hasT = tid && MLDatabase.getTournamentBoardSync(tid).length > 0;
    const mkTab = (label, v, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tab' + (on ? ' on' : ''); b.textContent = label; scope.on(b, 'click', () => { view = v; tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('on')); b.classList.add('on'); SFX.click(); fn(); }); tabs.appendChild(b); };
    Leaderboard.showGeneral();
    if (hasT) { mkTab('Umum', 'general', Leaderboard.showGeneral, true); mkTab('Turnamen Terakhir', 'tournament', () => Leaderboard.showTournament(tid), false); }
    /* papan berubah real-time (Firebase) -> tampilan ikut diperbarui */
    scope.add(Events.on('leaderboard', () => { if (view === 'general') Leaderboard.showGeneral(); }));
    scope.add(Events.on('tboard', id => { if (view === 'tournament' && id === tid) Leaderboard.showTournament(tid); }));
  }
});
