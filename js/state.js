/*
 * ============================================================
 * STATE.JS — UI STATE MACHINE
 * ============================================================
 * Satu-satunya pintu untuk berpindah layar: UI.set(NAMA_STATE).
 * Setiap perpindahan:
 *   1. memanggil exit() layar lama
 *   2. membuang semua listener / interval / timeout / RAF milik layar lama (Scope.dispose)
 *   3. menyembunyikan semua overlay lalu menampilkan overlay layar baru
 *   4. menulis body[data-ui] -> CSS memastikan HUD kontrol gameplay HANYA tampil di GAMEPLAY_STATE
 * Dengan begitu tidak ada tombol melayang & tidak ada timer yang menumpuk.
 */
const INTRO_STATE='INTRO',GATE_STATE='GATE',MENU_STATE='MENU',CHARACTER_SELECT_STATE='CHARACTER_SELECT',
  LOADING_STATE='LOADING',GAMEPLAY_STATE='GAMEPLAY',PAUSE_STATE='PAUSE',END_STATE='END',
  LEADERBOARD_STATE='LEADERBOARD',SHOP_STATE='SHOP',CINEMATIC_STATE='CINEMATIC',TOURNAMENT_END_STATE='TOURNAMENT_END';

const show=(id,v)=>{const e=document.getElementById(id);if(e)e.classList.toggle('hide',!v)};

/* Scope: kumpulan resource yang otomatis dibersihkan. */
function createScope(){
  const cleanups=[];let dead=false;
  return{
    on(target,ev,fn,opt){target.addEventListener(ev,fn,opt);cleanups.push(()=>target.removeEventListener(ev,fn,opt))},
    interval(fn,ms){const id=setInterval(fn,ms);cleanups.push(()=>clearInterval(id));return id},
    timeout(fn,ms){const id=setTimeout(()=>{if(!dead)fn()},ms);cleanups.push(()=>clearTimeout(id));return id},
    raf(fn){let id=0,alive=true;const loop=ts=>{if(!alive)return;try{fn(ts)}catch(e){console.error(e)}id=requestAnimationFrame(loop)};id=requestAnimationFrame(loop);cleanups.push(()=>{alive=false;cancelAnimationFrame(id)})},
    add(fn){cleanups.push(fn)},
    dispose(){dead=true;while(cleanups.length){try{cleanups.pop()()}catch(e){console.error(e)}}}
  };
}

const UI=(()=>{
  const defs={
    INTRO:{s:'intro',ov:[]},GATE:{s:'menu',ov:['gate']},MENU:{s:'menu',ov:['menu']},
    CHARACTER_SELECT:{s:'menu',ov:['charsel']},LOADING:{s:'load',ov:['load']},GAMEPLAY:{s:'play',ov:[]},
    PAUSE:{s:'pause',ov:['pause']},END:{s:'end',ov:[]},LEADERBOARD:{s:'menu',ov:['rank']},
    SHOP:{s:'menu',ov:['shop']},CINEMATIC:{s:'cine',ov:[]},TOURNAMENT_END:{s:'tend',ov:['tournamentEnd']}
  };
  const ALL_OV=['menu','gate','charsel','load','pause','end','rank','shop','prof','credits','tournamentEnd'];
  const handlers={};let cur=null,scope=null,params={};
  const modals={};

  function register(name,h){handlers[name]=h}
  function closeModals(){Object.keys(modals).forEach(id=>closeModal(id))}
  function openModal(id,enter){
    closeModal(id);
    const sc2=createScope();modals[id]={scope:sc2};
    show(id,1);
    try{enter&&enter(sc2)}catch(e){console.error(e)}
  }
  function closeModal(id){
    const m=modals[id];if(!m)return;
    m.scope.dispose();delete modals[id];show(id,0);
  }
  function isModalOpen(id){return !!modals[id]}

  function set(name,p={}){
    const d=defs[name];if(!d){console.error('UI state tidak dikenal',name);return}
    const prev=cur;
    if(prev&&handlers[prev]&&handlers[prev].exit){try{handlers[prev].exit()}catch(e){console.error(e)}}
    if(scope)scope.dispose();
    closeModals();
    cur=name;params=p;scope=createScope();
    document.body.dataset.ui=name;
    S=d.s;
    ALL_OV.forEach(id=>show(id,d.ov.includes(id)));
    if(typeof resetInput==='function'&&name!==GAMEPLAY_STATE)resetInput();
    if(handlers[name]&&handlers[name].enter){try{handlers[name].enter(scope,p,prev)}catch(e){console.error(e)}}
    Events.emit('ui',name,prev);
  }
  return{set,register,openModal,closeModal,isModalOpen,get state(){return cur},get params(){return params},is:n=>cur===n};
})();

/* Toast kecil (satu elemen dipakai ulang -> tidak menumpuk). */
const toast=(()=>{let tm=0;return(text,kind='')=>{const el=document.getElementById('toast');if(!el)return;el.textContent=text;el.className='show '+kind;clearTimeout(tm);tm=setTimeout(()=>{el.className=''},2200)}})();
