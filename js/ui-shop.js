/*
 * ============================================================
 * UI-SHOP.JS — SHOP_STATE : EduShop + panel kuis (slide dari kiri)
 * ============================================================
 * Koin hanya didapat dari kuis. Semua perubahan saldo lewat Economy
 * (economy.js) sehingga angka di Shop, profil, dan database selalu sama.
 */
const Quiz = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let deck = [];

  function numOptions(ans) {
    const set = new Set([ans]); const deltas = shuffle([1, -1, 2, -2, 10, -10, 5, -5, 3, -3, 20, -20]);
    for (const d of deltas) { if (set.size >= 4) break; const v = ans + d; if (v >= 0) set.add(v); }
    let k = 1; while (set.size < 4) set.add(ans + 30 + k++);
    return shuffle([...set]);
  }
  function mathQ(level) {
    let text, ans;
    const kind = pick(level === 0 ? ['add', 'sub'] : level === 1 ? ['add', 'sub', 'mul'] : level === 2 ? ['add', 'sub', 'mul', 'div'] : ['mul', 'div', 'mix', 'mix']);
    if (kind === 'add') { const m = level === 0 ? 30 : level === 1 ? 200 : 900; const a = rnd(5, m), b = rnd(5, m); text = `${a} + ${b} = ?`; ans = a + b; }
    else if (kind === 'sub') { const m = level === 0 ? 40 : level === 1 ? 300 : 900; let a = rnd(10, m), b = rnd(3, m); if (b > a) [a, b] = [b, a]; text = `${a} − ${b} = ?`; ans = a - b; }
    else if (kind === 'mul') { const a = level >= 2 ? rnd(11, 25) : rnd(2, 9), b = rnd(2, 9); text = `${a} × ${b} = ?`; ans = a * b; }
    else if (kind === 'div') { const b = rnd(2, 9), c = rnd(3, level >= 3 ? 25 : 12); text = `${b * c} ÷ ${b} = ?`; ans = c; }
    else { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9); if (Math.random() < .5) { text = `${a} + ${b} × ${c} = ?`; ans = a + b * c; } else { text = `(${a} + ${b}) × ${c} = ?`; ans = (a + b) * c; } }
    const opts = numOptions(ans);
    return { cat: 'Matematika', q: text, options: opts.map(String), answer: opts.indexOf(ans), exp: `Jawaban yang benar: ${ans}` };
  }
  function knowQ() {
    if (!deck.length) deck = shuffle(QUIZ_KNOWLEDGE.map((_, i) => i));
    const [q, opts, exp] = QUIZ_KNOWLEDGE[deck.pop()];
    const order = shuffle(opts.map((o, i) => ({ o, ok: i === 0 })));
    return { cat: 'Pengetahuan', q, options: order.map(x => x.o), answer: order.findIndex(x => x.ok), exp };
  }
  const next = streak => (Math.random() < .62 ? mathQ(Math.min(3, Math.floor(streak / 2))) : knowQ());

  function mount(scope, body) {
    const cfg = GAME_CONFIG.shop.quiz, limit = Math.max(5, +cfg.timeLimitSeconds || 30);
    let state = 'idle', q = null, deadline = 0, streak = 0, right = 0, total = 0, bar = null, tlabel = null;

    const stats = () => `<div class="qstats"><span>Benar <b>${right}</b>/${total}</span><span>Beruntun <b>${streak}</b></span></div>`;
    function renderIdle(msg = '') {
      state = 'idle';
      body.innerHTML = `<h3>📝 Bank Soal Sekolah</h3><p class="qrule">Jawab dalam <b>${limit} detik</b>.<br>Benar = <b class="gold">+${cfg.coinsPerCorrect} 🪙</b> (bonus +${cfg.streakBonus} tiap ${cfg.streakEvery} benar beruntun).<br>Salah / waktu habis = tidak dapat koin.</p>${msg}${stats()}<button class="b" id="qStart" type="button">${total ? 'SOAL BERIKUTNYA ▶' : 'MULAI KUIS'}</button>`;
    }
    function ask() {
      q = next(streak); state = 'ask'; deadline = performance.now() + limit * 1000;
      body.innerHTML = `<div class="qcat">${q.cat}</div><div class="qtext">${escapeHtml(q.q)}</div><div class="qtime"><i id="qBar"></i><b id="qSec">${limit}</b></div><div class="qopts">${q.options.map((o, i) => `<button class="qopt" data-i="${i}" type="button">${escapeHtml(o)}</button>`).join('')}</div>${stats()}`;
      bar = body.querySelector('#qBar'); tlabel = body.querySelector('#qSec');
    }
    function resolve(idx) {
      if (state !== 'ask') return; /* cegah klaim ganda */
      state = 'result'; total++;
      const ok = idx === q.answer, timeout = idx < 0;
      let gain = 0;
      if (ok) { right++; streak++; gain = cfg.coinsPerCorrect; if (cfg.streakEvery && streak % cfg.streakEvery === 0) gain += cfg.streakBonus; Economy.add(gain, 'quiz'); SFX.coin(); }
      else { streak = 0; SFX.wrong(); }
      body.querySelectorAll('.qopt').forEach(b => { b.disabled = true; const i = +b.dataset.i; if (i === q.answer) b.classList.add('ok'); else if (i === idx) b.classList.add('bad'); });
      const head = ok ? `<div class="qres ok">✔ BENAR! <b>+${gain} 🪙</b></div>` : `<div class="qres bad">${timeout ? '⏰ WAKTU HABIS!' : '✘ SALAH'} <small>Tidak dapat koin</small></div>`;
      body.insertAdjacentHTML('beforeend', `${head}<div class="qexp">${escapeHtml(q.exp)}</div><button class="b s" id="qNext" type="button">SOAL BERIKUTNYA ▶</button>`);
    }
    scope.on(body, 'click', e => {
      if (e.target.closest('#qStart') || e.target.closest('#qNext')) { SFX.click(); ask(); return; }
      const o = e.target.closest('.qopt'); if (o && state === 'ask') resolve(+o.dataset.i);
    });
    scope.interval(() => {
      if (state !== 'ask') return;
      const remain = Math.max(0, deadline - performance.now());
      if (bar) bar.style.width = (remain / (limit * 1000) * 100) + '%';
      if (tlabel) { tlabel.textContent = Math.ceil(remain / 1000); tlabel.classList.toggle('low', remain < 8000); }
      if (remain <= 0) resolve(-1);
    }, 100);
    renderIdle();
  }
  return { mount };
})();

UI.register(SHOP_STATE, {
  enter(scope) {
    let cat = 'upgrade', shown = Economy.balance(), target = shown;
    const grid = $('#shopGrid'), val = $('#coinVal'), pill = $('#coinPill'), panel = $('#quizPanel');
    panel.classList.remove('open');
    scope.add(() => panel.classList.remove('open'));
    val.textContent = shown;

    const pips = (l, m) => Array.from({ length: m }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('');
    function render() {
      if (cat === 'upgrade') {
        grid.innerHTML = SHOP_UPGRADES.map(u => {
          const l = Loadout.level(u.id), price = Loadout.upgradePrice(u.id), max = price === null;
          return `<div class="item" data-id="${u.id}"><div class="ico">${u.icon}</div><h3>${u.name}</h3><p>${u.desc}</p><div class="pips">${pips(l, u.max)}<small>Lv ${l}/${u.max}</small></div>
            <button class="buy-btn" data-kind="upgrade" data-id="${u.id}" type="button" ${max ? 'disabled' : ''}>${max ? 'MAKS' : `BELI · 🪙 ${price}`}</button><div class="nf">Uang Tidak Cukup!</div></div>`;
        }).join('');
      } else {
        grid.innerHTML = SHOP_WEAPONS.map(w => {
          const owned = Loadout.owns(w.id), eq = playerProfile.equippedWeapon === w.id;
          const btn = eq ? `<button class="buy-btn eq" disabled type="button">TERPASANG</button>` : owned ? `<button class="buy-btn" data-kind="equip" data-id="${w.id}" type="button">PASANG</button>` : `<button class="buy-btn" data-kind="weapon" data-id="${w.id}" type="button">BELI · 🪙 ${w.price}</button>`;
          return `<div class="item ${eq ? 'equipped' : ''}" data-id="${w.id}"><div class="ico" style="${w.color ? `box-shadow:0 0 18px ${w.color}` : ''}">${w.icon}</div><h3>${w.name}</h3><p>${w.desc}</p>${btn}<div class="nf">Uang Tidak Cukup!</div></div>`;
        }).join('');
      }
      document.querySelectorAll('#shopTabs .tab').forEach(b => b.classList.toggle('on', b.dataset.cat === cat));
    }
    render();

    scope.on($('#shopTabs'), 'click', e => { const b = e.target.closest('.tab'); if (!b) return; cat = b.dataset.cat; SFX.click(); render(); });
    scope.on(grid, 'click', e => {
      const btn = e.target.closest('.buy-btn'); if (!btn || btn.disabled) return;
      const id = btn.dataset.id, kind = btn.dataset.kind;
      if (kind === 'equip') { Loadout.equip(id); SFX.click(); toast('Senjata dipasang!', 'good'); render(); return; }
      const res = kind === 'upgrade' ? Loadout.buyUpgrade(id) : Loadout.buyWeapon(id);
      if (res.ok) { SFX.buy(); toast('Pembelian berhasil! ✔', 'good'); render(); }
      else if (res.reason === 'funds') {
        SFX.deny();
        const nf = btn.parentElement.querySelector('.nf');
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        nf.classList.add('show'); pill.classList.add('bad');
        scope.timeout(() => { nf.classList.remove('show'); pill.classList.remove('bad'); btn.classList.remove('shake'); }, 1600);
      }
    });

    /* saldo: animasi menuju nilai terbaru (satu RAF milik scope) */
    scope.add(Events.on('coins', (bal, delta) => {
      target = bal;
      if (delta > 0) { pill.classList.remove('gain'); void pill.offsetWidth; pill.classList.add('gain'); }
      render();
    }));
    scope.raf(() => {
      if (shown === target) return;
      const d = target - shown; shown += Math.abs(d) < 1 ? d : Math.sign(d) * Math.max(1, Math.ceil(Math.abs(d) * .15));
      val.textContent = shown;
    });

    scope.on($('#quizTab'), 'click', () => { SFX.click(); panel.classList.toggle('open'); });
    scope.on(window, 'keydown', e => { if (e.key === 'Escape') { if (panel.classList.contains('open')) panel.classList.remove('open'); else UI.set(MENU_STATE); } });
    Quiz.mount(scope, $('#quizBody'));
  }
});
