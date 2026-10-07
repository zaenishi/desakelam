/* ===== FULLSCREEN + LANDSCAPE ===== */
let fsDone = false;
let landscapeDone = false;

async function requestLandscape(){
  try{
    if(screen.orientation && typeof screen.orientation.lock === 'function'){
      await screen.orientation.lock('landscape');
      landscapeDone = true;
    }
  }catch(e){}
  fit();
}

async function requestGameFullscreen(){
  try{
    const el=document.documentElement;
    const f=el.requestFullscreen||el.webkitRequestFullscreen;
    if(f){
      const result=f.call(el);
      if(result && result.catch) await result.catch(()=>{});
      fsDone=true;
    }
  }catch(e){}
  await requestLandscape();
  fit();
}

async function enableImmersiveMode(){
  try{au()}catch(e){}
  if(GAME_CONFIG.ui.autoFullscreen && !fsDone) await requestGameFullscreen();
  else if(GAME_CONFIG.ui.autoLandscape && !landscapeDone) await requestLandscape();
}

addEventListener('pointerdown',()=>{void enableImmersiveMode()},{capture:true});
let rz;function fit(){const s=Math.min(innerWidth/W,innerHeight/H);C.style.transform=`translate(${(innerWidth-W*s)/2}px,${(innerHeight-H*s)/2}px) scale(${s})`}
addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(fit,80)});addEventListener('orientationchange',()=>setTimeout(fit,200));fit();
