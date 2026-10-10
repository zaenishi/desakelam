/* ===== IMMERSIVE MODE =====
 * Satu tombol kecil untuk fullscreen + landscape.
 * Browser tetap dapat memblokir fullscreen tanpa user gesture,
 * sehingga kita mencoba otomatis saat boot dan mengulang pada tap pertama.
 */
let immersiveActive = false;
let immersiveAttempted = false;
const immersiveButton = () => document.getElementById('immersiveToggle');

function isFullscreen(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function updateImmersiveButton(){
  const button = immersiveButton();
  if(!button) return;
  immersiveActive = isFullscreen();
  button.classList.toggle('hide', immersiveActive);
}

async function requestLandscape(){
  try{
    if(screen.orientation && typeof screen.orientation.lock === 'function'){
      await screen.orientation.lock('landscape');
      return true;
    }
  }catch(e){}
  return false;
}

async function requestGameFullscreen(){
  let fullscreenOk = isFullscreen();
  try{
    if(!fullscreenOk){
      const el=document.documentElement;
      const fn=el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if(fn){
        const result=fn.call(el,{navigationUI:'hide'});
        if(result && typeof result.then==='function') await result;
      }
      fullscreenOk=isFullscreen();
    }
  }catch(e){}

  if(fullscreenOk) await requestLandscape();
  fit();
  updateImmersiveButton();
  immersiveAttempted=true;
  return fullscreenOk;
}

async function exitImmersiveMode(){
  userExitedManually = true;
  try{
    if(screen.orientation && typeof screen.orientation.unlock==='function') screen.orientation.unlock();
  }catch(e){}
  try{
    if(isFullscreen()){
      const fn=document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if(fn) await fn.call(document);
    }
  }catch(e){}
  fit();
  updateImmersiveButton();
}

async function toggleImmersiveMode(){
  if(isFullscreen()) return exitImmersiveMode();
  userExitedManually = false;
  if(!fullscreenSupported()){
    if(typeof toast==='function') toast('Browser ini tidak mendukung layar penuh. Di iPhone: Bagikan → Tambah ke Layar Utama.','bad');
    return false;
  }
  return requestGameFullscreen();
}

async function enableImmersiveMode(){
  try{ if(typeof au==='function') au(); }catch(e){}
  if(isFullscreen()){
    await requestLandscape();
    updateImmersiveButton();
    return;
  }
  await requestGameFullscreen();
}

/*
 * Auto fullscreen + landscape lewat sentuhan.
 * PENTING: browser hanya mengizinkan requestFullscreen pada "user activation" yang sah.
 * Untuk layar sentuh itu adalah pointerup / touchend / click (BUKAN pointerdown),
 * untuk keyboard adalah keydown. Karena itu kita mendengarkan semuanya dan MENGULANG
 * setiap gesture sampai berhasil masuk fullscreen (tidak berhenti setelah percobaan pertama).
 * Jika pemain keluar lewat tombol ⛶, auto-masuk dihentikan agar tidak memaksa.
 */
let userExitedManually = false, fsBusy = false;
const fullscreenSupported = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
async function onActivationGesture(event){
  if(event.target && event.target.closest && event.target.closest('#immersiveToggle')) return;
  if(!fsDone){ fsDone = true; try{ au(); }catch(e){} }
  if(isFullscreen() || userExitedManually || fsBusy) return;
  if(!(GAME_CONFIG.ui.autoFullscreen || GAME_CONFIG.ui.autoLandscape)) return;
  /* Android/HP: otomatis. Desktop: tidak memaksa fullscreen (tombol ⛶ / F11 tersedia). */
  if(!Device.isMobile && !GAME_CONFIG.ui.autoFullscreenDesktop) return;
  if(!fullscreenSupported()) return;
  fsBusy = true;
  try{ await enableImmersiveMode(); }finally{ fsBusy = false; }
}
['pointerup','touchend','click','keydown'].forEach(ev => addEventListener(ev, onActivationGesture, {capture:true, passive:true}));

document.addEventListener('fullscreenchange',()=>{updateImmersiveButton();fit()});
document.addEventListener('webkitfullscreenchange',()=>{updateImmersiveButton();fit()});

const button=immersiveButton();
if(button) button.addEventListener('click', e=>{e.stopPropagation();void toggleImmersiveMode()});

let rz;
function fit(){
  const s=Math.min(innerWidth/W,innerHeight/H);
  hudK=cl(0.85/s,1,1.7); /* HUD di canvas diperbesar pada layar kecil agar tetap terbaca */
  C.style.transform=`translate(${(innerWidth-W*s)/2}px,${(innerHeight-H*s)/2}px) scale(${s})`;
}
addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(fit,80)});
addEventListener('orientationchange',()=>setTimeout(fit,200));
fit();
setTimeout(()=>{ if((GAME_CONFIG.ui.autoFullscreen || GAME_CONFIG.ui.autoLandscape) && Device.isMobile) void enableImmersiveMode(); },250);

/* Overlay "putar ke landscape" (hanya HP): tombolnya adalah gesture sah untuk fullscreen + kunci landscape. */
(function(){
  const t=document.getElementById('rotText'),btn=document.getElementById('rotBtn');
  if(t) t.textContent = Device.isIOS
    ? 'iPhone tidak mendukung layar penuh di browser. Putar HP ke landscape, atau buka menu Bagikan → "Tambah ke Layar Utama".'
    : 'Game ini dimainkan secara landscape. Putar HP Anda atau tekan tombol di bawah.';
  if(btn){
    if(Device.isIOS) btn.hidden=true;
    btn.addEventListener('click',()=>{ userExitedManually=false; void enableImmersiveMode(); });
  }
})();
