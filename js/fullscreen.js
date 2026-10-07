/* ===== IMMERSIVE MODE =====
 * Satu jalur resmi untuk fullscreen + landscape.
 * Portrait gameplay selalu diblokir dengan overlay fullscreen.
 * Tombol overlay sendiri menjadi fallback user-gesture yang paling aman.
 */
let immersiveActive=false;
let immersiveAttempted=false;
let fsDone=false;
const immersiveButton=()=>document.getElementById('immersiveToggle');
const rotAction=()=>document.getElementById('rotAction');

function isFullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement);}
function isMobileGameplay(){return !!(touch||matchMedia('(max-width:800px)').matches);}
function isPortraitGameplay(){return !!(isMobileGameplay()&&innerHeight>innerWidth&&(S==='play'||S==='intro'));}

function updateImmersiveButton(){
  const b=immersiveButton(); if(!b)return;
  const portrait=isPortraitGameplay();
  b.classList.toggle('hide',!portrait&&isFullscreen());
  b.textContent=portrait?'↻':'⛶';
  b.setAttribute('aria-label',portrait?'Aktifkan landscape':'Aktifkan layar penuh dan landscape');
  b.title=portrait?'Aktifkan landscape':'Layar penuh + landscape';
}

async function requestLandscape(){
  try{
    if(screen.orientation&&typeof screen.orientation.lock==='function'){
      await screen.orientation.lock('landscape');
      return true;
    }
  }catch(e){}
  return false;
}

async function requestGameFullscreen(){
  try{if(typeof au==='function')au();}catch(e){}
  let ok=isFullscreen();
  if(!ok){
    try{
      const el=document.documentElement;
      const fn=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;
      if(fn){const r=fn.call(el);if(r&&typeof r.then==='function')await r;}
    }catch(e){}
    ok=isFullscreen();
  }
  if(ok)fsDone=true;
  await requestLandscape();
  immersiveAttempted=true;
  fit();
  syncOrientationGate();
  return ok;
}

async function toggleImmersiveMode(){
  if(isPortraitGameplay()) return requestGameFullscreen();
  if(!isFullscreen()) return requestGameFullscreen();
  try{if(screen.orientation&&typeof screen.orientation.unlock==='function')screen.orientation.unlock();}catch(e){}
  try{
    const fn=document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen;
    if(fn)await fn.call(document);
  }catch(e){}
  fsDone=false;
  syncOrientationGate();
}

async function enableImmersiveMode(){return requestGameFullscreen();}

function fit(){
  if(typeof C==='undefined'||typeof W==='undefined'||typeof H==='undefined')return;
  const s=Math.min(innerWidth/W,innerHeight/H);
  C.style.transform=`translate(${(innerWidth-W*s)/2}px,${(innerHeight-H*s)/2}px) scale(${s})`;
}

function syncOrientationGate(){
  const rot=document.getElementById('rot');
  const blocked=isPortraitGameplay();
  if(rot){
    rot.classList.toggle('active',blocked);
    rot.setAttribute('aria-hidden',String(!blocked));
  }
  updateImmersiveButton();
  const rb=rotAction();
  if(rb)rb.disabled=!blocked;
  if(typeof setOrientationGameplayPause==='function')setOrientationGameplayPause(blocked);
}

const button=immersiveButton();
if(button)button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();void toggleImmersiveMode();});
const rb=rotAction();
if(rb)rb.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();void requestGameFullscreen();});

document.addEventListener('fullscreenchange',()=>{fit();syncOrientationGate();});
document.addEventListener('webkitfullscreenchange',()=>{fit();syncOrientationGate();});
addEventListener('orientationchange',()=>setTimeout(()=>{fit();syncOrientationGate();},120));
let rz;
addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{fit();syncOrientationGate();},80);});

fit();
syncOrientationGate();
setTimeout(()=>{
  if(GAME_CONFIG.ui.autoFullscreen||GAME_CONFIG.ui.autoLandscape){
    // Automatic requests may be rejected by the browser; never hide the fallback overlay.
    void enableImmersiveMode();
  }
},250);
