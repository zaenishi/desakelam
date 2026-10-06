/* ===== FULLSCREEN + LANDSCAPE (tap pertama) ===== */
let fsDone=0;
addEventListener('pointerdown',()=>{au();if(fsDone)return;fsDone=1;try{const el=document.documentElement,f=el.requestFullscreen||el.webkitRequestFullscreen;if(f){const p=f.call(el);const lk=()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}};p&&p.then?p.then(lk).catch(()=>{}):lk()}}catch(e){}},{capture:true});
let rz;function fit(){const s=Math.min(innerWidth/W,innerHeight/H);C.style.transform=`translate(${(innerWidth-W*s)/2}px,${(innerHeight-H*s)/2}px) scale(${s})`}
addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(fit,80)});addEventListener('orientationchange',()=>setTimeout(fit,200));fit();
