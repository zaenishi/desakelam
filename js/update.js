/* ===== UPDATE ===== */
function upPlayer(dt, ctl) {
  let kx = (inputKeys.KeyD || inputKeys.ArrowRight ? 1: 0) - (inputKeys.KeyA || inputKeys.ArrowLeft ? 1: 0) + joystickX,
  ky = (inputKeys.KeyS || inputKeys.ArrowDown ? 1: 0) - (inputKeys.KeyW || inputKeys.ArrowUp ? 1: 0) + joystickY;
  if (!ctl)kx = ky = 0;
  const l = Math.hypot(kx,
  ky);
  if (l > 1) {
    kx /= l;
    ky /= l
  }
  const mag = Math.min(1,
  l);
  let sprint = (inputKeys.ShiftLeft || inputKeys.ShiftRight || mag >.92 && isTouchDevice) && mag >.1 && player.st > 0 &&! inputKeys.__d;
  if (ctl && (inputKeys.ShiftLeft || inputKeys.ShiftRight) && dodgeInputBuffer > 0)sprint = false;
  player.cd -= dt;
  player.rage -= dt;
  player.skT -= dt;
  player.scd -= dt;
  if (player.skT <= 0)player.sk = 0;
  player.at -= dt;
  player.inv -= dt;
  player.noise -= dt;
  player.dcd -= dt;
  player.hf -= dt;
  player.cmT -= dt;
  if (player.cmT <= 0)player.cmb = 0;
  attackInputBuffer -= dt;
  dodgeInputBuffer -= dt;
  medkitInputBuffer -= dt;
  if (ctl && attackInputBuffer > 0) {
    atk();
    attackInputBuffer = 0
  }
  if (ctl && skillInputBuffer > 0) {
    skill();
    skillInputBuffer = 0
  }
  if (ctl && doorInputBuffer > 0) {
    useDoor();
    doorInputBuffer = 0
  }
  skillInputBuffer -= dt;
  doorInputBuffer -= dt;
  if (ctl && dodgeInputBuffer > 0 && player.dcd <= 0 && player.st >= 20) {
    player.dd =.18;
    player.dcd =.6;
    player.inv =.3;
    player.st -= 20;
    player.dodges++;
    updatePlayerStat('dodge',
    1);
    if (l >.1) {
      player.dx = kx / l * (l > 1 ? 1: l) || kx;
      player.dy = ky
    }
    SFX.swing();
    dodgeInputBuffer = 0;
    for (let i = 0; i < 6; i++)effects.push({
      k: 'p',
      x: player.x,
      y: player.y,
      vx: random() * 60 - 30,
      vy: random() * 60 - 30,
      elapsedTime:.4,
      c: '#777',
      s: 4
    })
  }
  if (ctl && medkitInputBuffer > 0 && player.meds > 0 && player.hp < player.mh) {
    player.meds--;
    player.hp = Math.min(player.mh,
    player.hp + 30);
    player.used++;
    SFX.pick();
    floatingTexts.push({
      s: '+30',
      x: player.x,
      y: player.y - 30,
      elapsedTime: 1,
      c: '#4f4',
      z: 16
    });
    medkitInputBuffer = 0
  }
  if (player.dd > 0) {
    player.dd -= dt;
    const n = Math.hypot(player.dx,
    player.dy) || 1;
    mvE(player,
    player.dx / n * 420 * dt,
    player.dy / n * 420 * dt)
  } else {
    const v = (sprint ? 200: 130) * getCurrentCharacterClass().speedMultiplier * (player.rage > 0 ? 1.2: 1) * mag;
    mvE(player,
    kx * (v / Math.max(mag,
    .01)) * dt * (mag > 0 ? 1: 0),
    ky * (v / Math.max(mag,
    .01)) * dt * (mag > 0 ? 1: 0));
    if (mag >.1) {
      player.dx = kx;
      player.dy = ky;
      if (player.at <= 0)player.face = Math.atan2(ky,
      kx);
      player.walked += v * dt;
      if (sprint) {
        player.st -= 15 * dt;
        player.noise =.3
      }
      player.sp -= dt;
      if (player.sp <= 0) {
        player.sp = sprint ?.25:.4;
        SFX.step(zoneAt(player.x,
        player.y))
      }
    }
  }
  player.mv = mag >.1;
  if (!sprint && player.at <= 0)player.st = Math.min(100,
  player.st + (player.mv ? 14: 24) * dt);
  player.st = Math.max(0,
  player.st);
  if (MODE == 'train')player.st = 100
}
function upGame(dt) {
  const ctl = gameState == 'play' || runtimeState.ctl;
  runtimeState.cdc = (runtimeState.cdc || 0) - dt;
  if (gameState == 'play') {
    runtimeState.ac = (runtimeState.ac || 0) - dt;
    if (runtimeState.ac <= 0) {
      runtimeState.ac = 1.5;
      checkAch()
    }
    runtimeState.autosaveTimer = (runtimeState.autosaveTimer || 0) - dt;
    if (runtimeState.autosaveTimer <= 0) {
      runtimeState.autosaveTimer = 10;
      savePlayerProfile()
    }
  }
  upPlayer(dt,
  ctl);
  const hr = ((18 * 60 + gameTime) / 60) % 24,
  ds = dk(hr);
  if (MODE == 'classic' && gameState == 'play') {
    gameTime += dt * 2;
    score += dt * 3;
    if (gameTime >= 720)newNight(500 * night,
    'Fajar... malam berikutnya lebih kelam.');
    if (!isInsideInterior)waveTimer -= dt;
    if (waveTimer <= 0 &&! isInsideInterior) {
      currentWave++;
      updatePlayerStat('wave',
      currentWave,
      1);
      waveTimer = 40;
      const n = Math.min(12,
      2 + currentWave);
      for (let i = 0; i < n; i++) {
        const a = random() * 7,
        x = clamp(player.x + Math.cos(a) * 520,
        40,
        worldWidth - 40),
        y = clamp(player.y + Math.sin(a) * 520,
        40,
        worldHeight - 40);
        if (hitO(x,
        y,
        24))continue;
        const m = mk(['sh',
        'sp',
        'bo',
        'gh'][random() * 4 | 0],
        x,
        y,
        1 + currentWave *.1 + (night - 1) *.25);
        go(m,
        'chase');
        monsters.push(m)
      }
      say('Gelombang ' + currentWave + ' mendekat!',
      3);
      if (currentWave > 1 && random() <.5) {
        const m = mk('sh',
        player.x - Math.cos(player.face) * 90,
        player.y - Math.sin(player.face) * 90,
        1);
        if (!hitO(m.x,
        m.y,
        14)) {
          go(m,
          'chase');
          monsters.push(m);
          scare()
        }
      }
    }
    weatherTimer -= dt;
    if (weatherTimer <= 0) {
      weatherTimer = 35 + random() * 25;
      weather = ['clear',
      'rain',
      'fog',
      'storm',
      'rain',
      'eclipse'][random() * 6 | 0];
      if (weather == 'storm')runtimeState.lt = 3;
      if (weather == 'eclipse') {
        const p = fp(random() * 7 | 0,
        400),
        g = mk('wo',
        p.x,
        p.y,
        .5);
        g.guard = 1;
        go(g,
        'patrol');
        monsters.push(g);
        say('GERHANA! Poin x2, monster elit muncul!',
        4)
      }
    }
    if (player.rs + player.nt >= 0 &&! isInsideInterior && zoneAt(player.x,
    player.y) == 6 && player.art >= 5 &&! bossActive) {
      bossActive = 1;
      const m = mk('wo',
      2000,
      1100,
      1);
      m.bossActive = 1;
      go(m,
      'chase');
      monsters.push(m);
      scare();
      SFX.howl();
      say('BOSS: Cursed Werewolf!',
      4)
    }
    const dark = ds >.6 || zoneAt(player.x,
    player.y) == 5 || weather == 'fog',
    near = monsters.some(m => m.st == 'chase' && dist(m,
    player) < 250);
    player.sn = clamp(player.sn + (dark ?- 1.2:.5) * dt * (near ? 3: 1),
    0,
    100);
    if (player.sn < 25 && random() < dt *.04)scare();
    if (player.sn <= 0)player.hp -= 2 * dt,
    player.hf =.1;
    if (player.hp <= 0 && gameState == 'play')dmgP(0)
  }
  if (MODE == 'train' && gameState == 'play')trainStep();
  if (weather == 'storm') {
    runtimeState.lt = (runtimeState.lt??4) - dt;
    if (runtimeState.lt <= 0) {
      runtimeState.lt = 6 + random() * 6;
      screenFlash = 1;
      SFX.thunder();
      screenShake = Math.max(screenShake,
      5)
    }
  }
  monsterNests.forEach(n => {
    n.fl -= dt; n.cd -= dt; if (n.cd <= 0 && Math.hypot(n.x - player.x,
    n.y - player.y) < 450 && monsters.length < 30) {
      n.cd = 10 + random() * 6; const m = mk(['sh',
      'sp'][random() * 2 | 0],
      n.x + 28,
      n.y,
      1 + (night - 1) *.25); go(m,
      'chase'); monsters.push(m)
    }
  });
  monsterNests = monsterNests.filter(n =>! n.dead);
  for (const m of monsters)upM(m,
  dt);
  monsters = monsters.filter(m =>! m.dead);
  for (let i = 0; i < monsters.length; i++)for (let j = i + 1; j < monsters.length; j++) {
    const a = monsters[i],
    b = monsters[j],
    d = dist(a,
    b),
    q = a.r + b.r;
    if (d < q && d > 0) {
      const p = (q - d) / 2,
      nx = (a.x - b.x) / d,
      ny = (a.y - b.y) / d;
      mvE(a,
      nx * p,
      ny * p,
      a.elapsedTime.fly);
      mvE(b,
      - nx * p,
      - ny * p,
      b.elapsedTime.fly)
    }
  }
  projectiles.forEach(p => {
    p.x += p.vx * dt; p.y += p.vy * dt; p.elapsedTime -= dt; if (p.f) {
      for (const m of monsters)if (m.st != 'death' && Math.hypot(p.x - m.x,
      p.y - m.y) < m.r + 6) {
        hurtM(m,
        p.d,
        0); p.elapsedTime = 0; break
      }
    } else if (Math.hypot(p.x - player.x,
    p.y - player.y) < player.r + 6) {
      dmgP(p.d); p.elapsedTime = 0
    }
  });
  projectiles = projectiles.filter(p => p.elapsedTime > 0);
  for (const it of items) {
    const d = dist(player,
    it);
    if (it.k == 'cd') {
      if (d < 28 &&! it.lit && runtimeState.cdc <= 0)cdTouch(it);
      continue
    }
    if (it.k == 'chest' &&! roomState.open)continue;
    if (d < (it.k == 'npc' ? 44: it.k == 'chest' ? 36: 28) &&! it.got) {
      it.got = 1;
      SFX.pick();
      if (it.k == 'med') {
        player.meds++;
        say('Medkit +1 (tekan E / MED)',
        2)
      }
      if (it.k == 'chest') {
        addScore(300 * night);
        player.meds++;
        player.sn = Math.min(100,
        player.sn + 20);
        say('Peti terbuka! +' + 300 * night,
        3)
      }
      if (it.k == 'art') {
        player.art++;
        updatePlayerStat('art',
        1);
        addScore(150 * night);
        say(`Artefak ${player.art}/5 terkumpul`,
        3);
        SFX.lvl();
        if (player.art >= 5)say('Semua artefak terkumpul! Menuju Menara Terkutuk!',
        5)
      }
      if (it.k == 'note') {
        player.nt++;
        updatePlayerStat('nt',
        1);
        addScore(20);
        player.sn = Math.min(100,
        player.sn + 10);
        say(LORE[it.i],
        5)
      }
      if (it.k == 'npc') {
        player.rs++;
        updatePlayerStat('rs',
        1);
        addScore(100);
        player.hp = Math.min(player.mh,
        player.hp + 25);
        player.sn = Math.min(100,
        player.sn + 25);
        say(`Penyintas ${player.rs}/3 diselamatkan. Mereka membekalimu.`,
        4)
      }
    }
  }
  items = items.filter(i =>! i.got);
  effects.forEach(f => {
    f.elapsedTime -= dt; if (f.k == 'p') {
      f.x += f.vx * dt; f.y += f.vy * dt; f.vx *=.94; f.vy *=.94
    }
  });
  effects = effects.filter(f => f.elapsedTime > 0);
  floatingTexts.forEach(x => {
    x.elapsedTime -= dt; x.y -= 25 * dt
  });
  floatingTexts = floatingTexts.filter(x => x.elapsedTime > 0);
  if (statusMessage && (statusMessage.elapsedTime -= dt) <= 0)statusMessage = null;
  if (scareEffect && (scareEffect.elapsedTime -= dt) <= 0)scareEffect = null;
  /* musik dinamis + detak jantung */
  mus(dt);
  runtimeState.hb = (runtimeState.hb || 0) - dt;
  if (audioContext && dg) {
    const c = monsters.some(m => m.st == 'chase');
    dg.gain.value = c ?.09:.045;
    if (player.hp < player.mh *.4 && runtimeState.hb <= 0) {
      SFX.heart();
      runtimeState.hb =.4 + player.hp / player.mh * 1.2
    }
    if (c && (runtimeState.dr = (runtimeState.dr || 0) - dt) <= 0) {
      runtimeState.dr =.5;
      tone(55,
      .2,
      'sine',
      .25)
    }
    if ((runtimeState.am = (runtimeState.am || 0) - dt) <= 0) {
      runtimeState.am = 6 + random() * 8;
      [SFX.howl,
      SFX.cricket][random() * 2 | 0]()
    }
  }
  if (player.hp < player.mh)player.hp = Math.min(player.mh,
  player.hp + 0)
}
function dk(h) {
  return h >= 18 && h < 20 ?.3 + (h - 18) *.25: h >= 20 || h < 4 ?.85: h >= 4 && h < 6 ?.85 - (h - 4) *.2:.4
}
function trainStep() {
  const s = trainingStep;
  if (s == 0 && player.walked > 200)nx();
  else if (s == 1 && player.swings >= 3)nx();
  else if (s == 2) {
    if (!runtimeState.d) {
      const m = mk('sh',
      player.x + 260,
      player.y,
      .5);
      m.sp0 = 1;
      go(m,
      'chase');
      monsters.push(m);
      runtimeState.d = m;
      runtimeState.k0 = player.kills
    }
    if (player.kills > runtimeState.k0) {
      nx()
    }
  } else if (s == 3 && player.dodges >= 1)nx();
  else if (s == 4) {
    if (!runtimeState.m) {
      runtimeState.m = {
        k: 'med',
        x: player.x + 200,
        y: player.y - 100
      };
      items.push(runtimeState.m);
      player.hp = 60
    }
    if (player.used >= 1)nx()
  } else if (s == 5) {
    if (!runtimeState.a) {
      runtimeState.a = {
        k: 'art',
        x: player.x + 250,
        y: player.y + 60
      };
      items.push(runtimeState.a)
    }
    if (player.art >= 1) {
      saveLocalJson('ml_skin',
      1);
      playerProfile.skinUnlocked = 1;
      savePlayerProfile();
      win()
    }
  }
}
function nx() {
  trainingStep++;
  runtimeState = {
    ctl: runtimeState.ctl
  };
  SFX.lvl();
  say('Langkah selesai!',
  1.2)
}
