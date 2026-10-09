/* ===== TOURNAMENT MANAGER ===== */
const Tournament =(() => {
  let timer = 0, armed = false, ending = false, warningShown = false; const cfg =() => GAME_CONFIG.tournament || {
  }; const pad = n => String(n).padStart(2, '0'); const today =() => {
    const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  }; function parse(v) {
    if(v === false || v == null)return null; const m = /^(\d{1,2}):(\d{2})$/.exec(String(v)); if(!m)return null; const h = + m[1], min = + m[2]; if(h > 23 || min > 59)return null; return {
      h, min
    }
  }
  function ts(v) {
    const t = parse(v); if(!t)return Infinity; const d = new Date(); d.setHours(t.h, t.min, 0, 0); return d.getTime()
  }
  function configured() {
    return cfg().enabled !== false && cfg().enabledToday !== false && cfg().endTime !== false && !!parse(cfg().endTime)
  }
  function day() {
    return configured() &&(!cfg().date || cfg().date === today())
  }
  function startTs() {
    return ts(cfg().startTime || '00:00')
  }
  function endTs() {
    return ts(cfg().endTime)
  }
  function active(now = Date.now()) {
    return day() && now >= startTs() && now < endTs()
  }
  function past(now = Date.now()) {
    return day() && now >= endTs()
  }
  function start() {
    if(timer)return; timer = setInterval(tick, 250); tick()
  }
  function stop() {
    if(timer) {
      clearInterval(timer); timer = 0
    }
  }
  function arm() {
    if(active()) {
      armed = true; warningShown = false
    }
  }
  function disarm() {
    armed = false; warningShown = false
  }
  function tick() {
    if(gameState === 'menu') {
      const b = domQuery('#tournamentBtn'); const st = domQuery('#tournamentStatus'); if(b)b.textContent = label(); if(st)st.textContent = status()
    }
    if(ending || !day()) {
      if(!day())disarm(); return
    }
    const now = Date.now(); if(gameState === 'play' && !armed && active(now))arm(); if(!armed)return; const remain = endTs() - now; if(!warningShown && remain <= Math.max(1, + cfg().warningMinutes || 1) * 60000 && remain > 0) {
      warningShown = true; warn()
    }
    if(now >= endTs())finishSequence()
  }
  function warn() {
    const el = domQuery('#tournamentWarning'); if(!el)return; el.textContent = 'SISA WAKTU 1 MENIT'; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); try {
      tone(440, .5, 'square', .2); setTimeout(() => tone(330, .5, 'square', .18), 180)
    } catch(e) {
    }
  }
  function finishSequence() {
    if(ending)return; ending = true; stop(); try {
      submitScore(score|0)
    } catch(e) {
    }
    gameState = 'tournamentEnd'; domQuery('#pb').style.display = 'none'; domQuery('#tc').style.display = 'none'; const ov = domQuery('#tournamentEnd'); if(!ov) {
      ending = false; toMenu(); return
    }
    show('tournamentEnd', 1); countdown( + cfg().countdownSeconds || 3, () => winners(0))
  }
  function countdown(n, done) {
    const title = domQuery('#tCountdownTitle'), el = domQuery('#tCountdown'); if(title)title.textContent = 'TURNAMEN BERAKHIR'; let x = n; const step =() => {
      if(x <= 0) {
        if(el)el.textContent = 'WAKTU HABIS'; setTimeout(done, 1000); return
      }
      if(el)el.textContent = x; try {
        tone(180 + x * 100, .3, 'square', .2)
      } catch(e) {
      }
      x--; setTimeout(step, 1000)
    }; step()
  }
  function winners(i) {
    const list =(MLDatabase.getLeaderboardSync?MLDatabase.getLeaderboardSync():[]).slice().sort((a, b) =>(b.score || 0) -(a.score || 0)).slice(0, + cfg().topWinners || 3); if(i >= list.length) {
      setTimeout(finish, 1000); return
    }
    const e = list[i], el = domQuery('#tWinner'); if(el) {
      el.innerHTML = `<div class="t-rank">PEMENANG NO ${i+1}</div><div class="t-name">${escapeHtml(e.name||'?')}</div><div class="t-score">${e.score||0} POIN</div>`; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show')
    }
    setTimeout(() => winners(i + 1), + cfg().revealDelayMs || 2200)
  }
  function finish() {
    ending = false; armed = false; warningShown = false; show('tournamentEnd', 0); show('tournamentWarning', 0); if(cfg().redirectToLeaderboard)openRanking(); else toMenu()
  }
  function label() {
    return!configured() || past()?'START':'TURNAMEN'
  }
  function status() {
    if(!configured() || past())return ''; if(Date.now() < startTs())return `Mulai ${cfg().startTime}`; return `Aktif · sisa ${Math.max(0,Math.ceil((endTs()-Date.now())/1000))} detik`
  }
  function escapeHtml(v) {
    return String(v).replace(/[&<>\"]/g, c =>({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', '\\':'&#92;'
    }
    [c] || c))
  }
  return Object.freeze({
    start, stop, tick, armIfPlaying:arm, disarm, isWithinWindow:active, isPastEnd:past, getMenuLabel:label, getStatusText:status
  }); 
})();
