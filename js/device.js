/*
 * ============================================================
 * DEVICE.JS — DETEKSI PERANGKAT & PENGATURAN KONTROL
 * ============================================================
 * Membedakan Android / iOS / Desktop, lalu menulis kelas ke <body>:
 *   dev-android | dev-ios | dev-mobile | dev-desktop   (platform)
 *   touch | kbd                                          (skema kontrol aktif)
 * Semua keputusan UI (joystick, tombol, hint teks, auto-fullscreen,
 * getar, overlay putar layar) membaca dari sini.
 * Pemain bisa menimpa kontrol lewat menu Setelan (disimpan di localStorage).
 */
const Device = (() => {
  const KEY = 'ml_settings_v1';
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
  const coarse = matchMedia('(pointer:coarse)').matches;
  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  const small = Math.min(screen.width || 0, screen.height || 0) <= 900;
  const platform = isAndroid ? 'android' : isIOS ? 'ios' : (coarse && hasTouch && small ? 'mobile' : 'desktop');
  const isMobile = platform !== 'desktop';

  let settings = { controls: 'auto', vibrate: true };
  try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  let sensedTouch = false;
  const subs = new Set();

  const touchUI = () => settings.controls === 'touch' ? true : settings.controls === 'keyboard' ? false : (isMobile || sensedTouch);

  function apply() {
    const b = document.body; if (!b) return;
    ['dev-android', 'dev-ios', 'dev-mobile', 'dev-desktop'].forEach(c => b.classList.remove(c));
    b.classList.add('dev-' + platform);
    if (isMobile) b.classList.add('dev-mobile');
    b.classList.toggle('touch', touchUI());
    b.classList.toggle('kbd', !touchUI());
    subs.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) {} }

  /* Laptop layar sentuh / DevTools: sentuhan nyata pertama mengaktifkan kontrol sentuh. */
  addEventListener('pointerdown', e => {
    if ((e.pointerType === 'touch' || e.pointerType === 'pen') && !sensedTouch) { sensedTouch = true; if (settings.controls === 'auto') apply(); }
  }, { capture: true, passive: true });

  const api = {
    platform, isAndroid, isIOS, isMobile,
    get touchUI() { return touchUI(); },
    get settings() { return Object.assign({}, settings); },
    set(key, value) { settings[key] = value; save(); apply(); },
    onChange(fn) { subs.add(fn); return () => subs.delete(fn); },
    vibrate(ms) { if (settings.vibrate && isMobile && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } },
    label() {
      const p = { android: 'Android', ios: 'iPhone/iPad', mobile: 'Perangkat sentuh', desktop: 'Desktop' }[platform];
      return `${p} · kontrol ${touchUI() ? 'sentuh' : 'keyboard'}${settings.controls === 'auto' ? ' (otomatis)' : ''}`;
    },
    /* teks petunjuk kontrol sesuai perangkat */
    hint: () => touchUI() ? 'Joystick kiri = gerak · HIT = serang · SKILL, DODGE, MED di kanan' : 'WASD / Panah = gerak · J / Spasi = serang · K = skill · Shift = hindar · E = medkit · F = masuk rumah',
    apply
  };
  apply();
  return api;
})();
