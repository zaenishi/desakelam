/* ===== INPUT ===== */
const keys = {
};
let attackBuffer = 0, dodgeBuffer = 0, medkitBuffer = 0, skillBuffer = 0, doorBuffer = 0, joystickX = 0, joystickY = 0, joystickPointerId = null, joystickOrigin;
addEventListener('keydown', e => {
  if(e.target.tagName == 'INPUT')return; keys[e.code] = 1; if(e.code == 'KeyK' || e.code == 'KeyQ')skillBuffer = .12; if(e.code == 'KeyF')doorBuffer = .12; if(e.code == 'Space' || e.code == 'KeyJ') {
    attackBuffer = .12; e.preventDefault()
  }
  if(e.code.startsWith('Shift'))dodgeBuffer = .12; if(e.code == 'KeyE')medkitBuffer = .12; if(e.code == 'Escape')pauseT(); au()
});
addEventListener('keyup', e => keys[e.code] = 0);
const jz = domQuery('#jz'), jb = domQuery('#jb'), jk = domQuery('#jk');
jz.addEventListener('pointerdown', e => {
  joystickPointerId = e.pointerId; joystickOrigin = {
    x:e.clientX, y:e.clientY
  }; try {
    jz.setPointerCapture(joystickPointerId)
  } catch(_) {
  }
  jb.style.cssText = `display:block;left:${joystickOrigin.x-50}px;top:${joystickOrigin.y-50}px`; jk.style.cssText = `display:block;left:${joystickOrigin.x-22}px;top:${joystickOrigin.y-22}px`
});
jz.addEventListener('pointermove', e => {
  if(e.pointerId != joystickPointerId)return; const dx = e.clientX - joystickOrigin.x, dy = e.clientY - joystickOrigin.y, l = Math.hypot(dx, dy) || 1, m = Math.min(l, 50); joystickX = dx / l * m / 50; joystickY = dy / l * m / 50; jk.style.left = joystickOrigin.x - 22 + joystickX * 50 + 'px'; jk.style.top = joystickOrigin.y - 22 + joystickY * 50 + 'px'
});
const je = e => {
  if(e.pointerId == joystickPointerId) {
    joystickPointerId = null;
    joystickX = joystickY = 0;
    jb.style.display = jk.style.display = 'none'
  }
};
jz.addEventListener('pointerup', je);
jz.addEventListener('pointercancel', je);
[['#bS', () => skillBuffer = .12], ['#bI', () => doorBuffer = .12], ['#bH', () => attackBuffer = .12], ['#bD', () => dodgeBuffer = .12], ['#bE', () => medkitBuffer = .12]].forEach(([s, f]) => domQuery(s).addEventListener('pointerdown', e => {
  e.preventDefault(); f(); au()
}));
