/*
 * ============================================================
 * UI-SETTINGS.JS — modal Setelan: kontrol, getar, layar penuh,
 * info perangkat, dan Tes Koneksi database (diagnosis Firebase).
 * ============================================================
 */
const Settings = (() => {
  function fmtDiag(st) {
    if (st.provider !== 'firebase') return 'Database: lokal (IndexedDB).\nUntuk memakai Firebase: isi FIREBASE_CONFIG dan ubah DATABASE_CONFIG.provider menjadi \'firebase\' di js/config.js.';
    const state = st.online ? 'TERHUBUNG ✔' : st.connecting ? 'MENGHUBUNGKAN…' : 'GAGAL ✖ (memakai data lokal)';
    const out = [`Provider : firebase`, `Status   : ${state}`, `Percobaan: ${st.attempts}`];
    (st.steps || []).forEach(s => {
      out.push(` ${s.ok ? '✔' : '✖'} ${s.label} (${s.ms} ms)${s.ok ? '' : '\n    ' + s.error}`);
      if (!s.ok && s.hint) out.push('    → ' + s.hint);
    });
    if (st.error && !(st.steps || []).some(s => !s.ok)) out.push('Error    : ' + st.error);
    if (st.online) out.push(st.lastWriteError ? `Tulis    : DITOLAK — ${st.lastWriteError}` : 'Tulis    : OK');
    if (st.lastWriteError && st.hint) out.push('    → ' + st.hint);
    if (!st.online && !st.connecting) out.push('(Mencoba lagi otomatis tiap beberapa detik.)');
    return out.join('\n');
  }
  function open() {
    UI.openModal('settings', scope => {
      const setC = $('#setControls'), setV = $('#setVib'), info = $('#setInfo'), diag = $('#dbDiag');
      const refresh = () => {
        const s = Device.settings;
        setC.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === s.controls));
        setV.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.v === '1') === !!s.vibrate));
        info.textContent = `${Device.label()} · layar ${innerWidth}×${innerHeight} · ${isFullscreen() ? 'layar penuh' : 'jendela'}`;
      };
      scope.on(setC, 'click', e => { const b = e.target.closest('button'); if (!b) return; SFX.click(); Device.set('controls', b.dataset.v); jIdle(); refresh(); });
      scope.on(setV, 'click', e => { const b = e.target.closest('button'); if (!b) return; Device.set('vibrate', b.dataset.v === '1'); SFX.click(); Device.vibrate(40); refresh(); });
      scope.on($('#setFs'), 'click', () => { SFX.click(); toggleImmersiveMode().then(() => setTimeout(refresh, 400)); });
      scope.on($('#setDiag'), 'click', async () => { SFX.click(); diag.textContent = 'Menguji koneksi…'; diag.textContent = fmtDiag(await MLDatabase.reconnect()); });
      scope.on(window, 'resize', refresh);
      scope.on(window, 'keydown', e => { if (e.key === 'Escape') UI.closeModal('settings'); });
      scope.add(Events.on('dbstatus', st => { if (diag.textContent) diag.textContent = fmtDiag(st); }));
      refresh();
      if (MLDatabase.status().provider === 'firebase') diag.textContent = fmtDiag(MLDatabase.status());
    });
  }
  return { open, fmtDiag };
})();
