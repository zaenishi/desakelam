/* ===== INPUT ===== */
const inputKeys = {
};
let attackInputBuffer = 0, dodgeInputBuffer = 0, medkitInputBuffer = 0, skillInputBuffer = 0, doorInputBuffer = 0, joystickX = 0, joystickY = 0, joystickPointerId = null, joystickOrigin;
addEventListener('keydown', e => {
  if (e.target.tagName == 'INPUT')return; inputKeys[e.code] = 1; if (e.code == 'KeyK' || e.code == 'KeyQ')skillInputBuffer =.12; if (e.code == 'KeyF')doorInputBuffer =.12; if (e.code == 'Space' || e.code == 'KeyJ') {
    attackInputBuffer =.12; e.preventDefault()
  }
  if (e.code.startsWith('Shift'))dodgeInputBuffer =.12; if (e.code == 'KeyE')medkitInputBuffer =.12; if (e.code == 'Escape')pauseT(); au()
});
addEventListener('keyup', e => inputKeys[e.code] = 0);
const jz = querySelector('#jz'), jb = querySelector('#jb'), jk = querySelector('#jk');
jz.addEventListener('pointerdown', e => {
  joystickPointerId = e.pointerId; joystickOrigin = {
    x: e.clientX,
    y: e.clientY
  }; try {
    jz.setPointerCapture(joystickPointerId)
  } catch (_) {
  }
  jb.style.cssText = `display:block;left:${joystickOrigin.x-50}px;top:${joystickOrigin.y-50}px`; jk.style.cssText = `display:block;left:${joystickOrigin.x-22}px;top:${joystickOrigin.y-22}px`
});
jz.addEventListener('pointermove', e => {
  if (e.pointerId != joystickPointerId)return; const dx = e.clientX - joystickOrigin.x,
  dy = e.clientY - joystickOrigin.y,
  l = Math.hypot(dx,
  dy) || 1,
  m = Math.min(l,
  50); joystickX = dx / l * m / 50; joystickY = dy / l * m / 50; jk.style.left = joystickOrigin.x - 22 + joystickX * 50 + 'px'; jk.style.top = joystickOrigin.y - 22 + joystickY * 50 + 'px'
});
const je = e => {
  if (e.pointerId == joystickPointerId) {
    joystickPointerId = null;
    joystickX = joystickY = 0;
    jb.style.display = jk.style.display = 'none'
  }
};
jz.addEventListener('pointerup', je);
jz.addEventListener('pointercancel', je);
[['#bS', () => skillInputBuffer =.12], ['#bI', () => doorInputBuffer =.12], ['#bH', () => attackInputBuffer =.12], ['#bD', () => dodgeInputBuffer =.12], ['#bE', () => medkitInputBuffer =.12]].forEach(([s, f]) => querySelector(s).addEventListener('pointerdown', e => {
  e.preventDefault(); f(); au()
}));
