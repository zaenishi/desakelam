/*
 * ============================================================
 * ECONOMY.JS — KOIN, UPGRADE SKILL, SENJATA
 * ============================================================
 * Semua perubahan koin/loadout WAJIB lewat sini, supaya saldo
 * konsisten di Shop, profil, dan tersimpan ke database.
 */
const Economy = Object.freeze({
  balance: () => playerProfile.coins | 0,
  canAfford: n => (playerProfile.coins | 0) >= n,
  add(n, reason = '') {
    n = Math.max(0, Math.floor(n));
    if (!n) return;
    playerProfile.coins = (playerProfile.coins | 0) + n;
    savePlayerProfile();
    Events.emit('coins', playerProfile.coins, n, reason);
  },
  spend(n, reason = '') {
    n = Math.floor(n);
    if (n <= 0 || (playerProfile.coins | 0) < n) return false;
    playerProfile.coins -= n;
    savePlayerProfile();
    Events.emit('coins', playerProfile.coins, -n, reason);
    return true;
  }
});

const Loadout = (() => {
  const lvl = id => Math.min((SHOP_UPGRADES.find(u => u.id === id) || { max: 0 }).max, playerProfile.upgrades[id] | 0);
  const weaponDef = id => SHOP_WEAPONS.find(w => w.id === id) || SHOP_WEAPONS[0];
  return {
    level: lvl,
    weapon: () => weaponDef(playerProfile.equippedWeapon),
    owns: id => playerProfile.weapons.includes(id),
    /* modifier serangan dasar dari senjata */
    mods() { const w = weaponDef(playerProfile.equippedWeapon); return { dmg: w.dmg, range: w.range, rate: w.rate, color: w.color }; },
    /* modifier skill dari upgrade */
    skill() {
      const g = id => 1 + lvl(id) * (SHOP_UPGRADES.find(u => u.id === id).per);
      return { cd: Math.max(.4, 1 - lvl('cd') * SHOP_UPGRADES.find(u => u.id === 'cd').per), pow: g('pow'), dur: g('dur'), rng: g('rng') };
    },
    upgradePrice(id) {
      const u = SHOP_UPGRADES.find(x => x.id === id); const l = lvl(id);
      return l >= u.max ? null : u.prices[l];
    },
    buyUpgrade(id) {
      const u = SHOP_UPGRADES.find(x => x.id === id); if (!u) return { ok: false, reason: 'unknown' };
      const price = this.upgradePrice(id);
      if (price === null) return { ok: false, reason: 'max' };
      if (!Economy.canAfford(price)) return { ok: false, reason: 'funds' };
      Economy.spend(price, 'upgrade:' + id);
      playerProfile.upgrades[id] = lvl(id) + 1;
      savePlayerProfile();
      return { ok: true };
    },
    buyWeapon(id) {
      const w = SHOP_WEAPONS.find(x => x.id === id); if (!w) return { ok: false, reason: 'unknown' };
      if (this.owns(id)) return { ok: false, reason: 'owned' };
      if (!Economy.canAfford(w.price)) return { ok: false, reason: 'funds' };
      Economy.spend(w.price, 'weapon:' + id);
      playerProfile.weapons.push(id);
      playerProfile.equippedWeapon = id;
      savePlayerProfile();
      return { ok: true };
    },
    equip(id) {
      if (!this.owns(id)) return false;
      playerProfile.equippedWeapon = id; savePlayerProfile(); return true;
    }
  };
})();
