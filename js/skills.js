/*
 * ============================================================
 * SKILLS.JS — CHARACTER SKILLS + COOLDOWN
 * ============================================================
 */

const ring = (color, radius) => FX.push({
  k: 'ring',
  x: P.x,
  y: P.y,
  r: radius,
  c: color,
  t: .4
});

function getSkillCooldown() {
  const character = getCurrentCharacterClass();

  return (
    Number(character.skillCooldown || 0) *
    Number(GAME_CONFIG.gameplay.skillCooldownMultiplier || 1)
  );
}

function skill() {
  const character = getCurrentCharacterClass();

  if (P.scd > 0) {
    say(
      `${character.skillName} cooldown ${Math.ceil(P.scd)}s`,
      1.2
    );
    return;
  }

  const areaDamage = (radius, damage) => {
    M.forEach(monster => {
      if (
        monster.st !== 'death' &&
        dist(monster, P) <
          radius + monster.r
      ) {
        hurtM(
          monster,
          damage,
          1
        );
      }
    });

    NS.forEach(nest => {
      if (
        Math.hypot(
          nest.x - P.x,
          nest.y - P.y
        ) < radius
      ) {
        hitN(nest, damage);
      }
    });
  };

  const cooldown = getSkillCooldown();

  P.scd = cooldown;
  SFX.crit();
  shake = Math.max(shake, 8);

  if (character.id === 'kn') {
    P.inv = 2;
    areaDamage(100, 25);
    ring('#8cf', 100);
  } else if (character.id === 'ma') {
    areaDamage(170, 40);
    ring('#c6f', 170);
  } else if (character.id === 'ar') {
    for (let i = -2; i <= 2; i++) {
      const angle =
        P.face + i * .18;

      PR.push({
        f: 1,
        x: P.x,
        y: P.y,
        vx: Math.cos(angle) * 520,
        vy: Math.sin(angle) * 520,
        t: .8,
        d: 20
      });
    }
  } else if (character.id === 'ro') {
    let target = null;
    let targetDistance = 260;

    M.forEach(monster => {
      const distance =
        dist(monster, P);

      if (
        monster.st !== 'death' &&
        distance < targetDistance
      ) {
        targetDistance = distance;
        target = monster;
      }
    });

    if (target) {
      const angle =
        Math.atan2(
          target.y - P.y,
          target.x - P.x
        );

      P.x = cl(
        target.x -
          Math.cos(angle) * 30,
        15,
        WW - 15
      );

      P.y = cl(
        target.y -
          Math.sin(angle) * 30,
        15,
        WH - 15
      );

      hurtM(target, 55, 1);
      P.inv = .6;
    } else {
      P.scd = 1;
      say('Tidak ada target Shadow Strike.', 1.5);
    }
  } else if (character.id === 'pr') {
    P.hp = Math.min(
      P.mh,
      P.hp + 35
    );

    P.sn = Math.min(
      100,
      P.sn + 30
    );

    areaDamage(120, 15);
    ring('#ff8', 120);
  } else {
    P.rage = 6;
    ring('#f60', 90);
  }

  say(
    `${character.skillName} aktif · CD ${cooldown}s`,
    1.5
  );
}
