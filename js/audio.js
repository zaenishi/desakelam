/* ===== AUDIO (Web Audio, sintetis) ===== */
let AC = null, mg, dg;
function au() {
  try {
    if(!AC) {
      AC = new(window.AudioContext || window.webkitAudioContext)();
      mg = AC.createGain();
      mg.gain.value = .6;
      mg.connect(AC.destination);
      const o = AC.createOscillator(),
      l = AC.createOscillator(),
      lg = AC.createGain();
      dg = AC.createGain();
      dg.gain.value = .05;
      o.type = 'sawtooth';
      o.frequency.value = 48;
      l.frequency.value = .15;
      lg.gain.value = 10;
      l.connect(lg);
      lg.connect(o.frequency);
      o.connect(dg);
      dg.connect(mg);
      o.start();
      l.start()
    }
    if(AC.state == 'suspended')AC.resume()
  } catch(e) {
    AC = null
  }
}
function tone(f, d, ty = 'sine', v = .2, sl = 0, dl = 0) {
  if(!AC)return;
  const o = AC.createOscillator(),
  g = AC.createGain(),
  n = AC.currentTime + dl;
  o.type = ty;
  o.frequency.setValueAtTime(f, n);
  if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20, f + sl), n + d);
  g.gain.setValueAtTime(v, n);
  g.gain.exponentialRampToValueAtTime(.001, n + d);
  o.connect(g);
  g.connect(mg);
  o.start(n);
  o.stop(n + d + .02)
}
function noise(d, v = .2, fr = 1000) {
  if(!AC)return;
  const n = AC.sampleRate * d|0,
  b = AC.createBuffer(1, n, AC.sampleRate),
  a = b.getChannelData(0);
  for(let i = 0; i < n; i++)a[i] =(randomValue() * 2 - 1) *(1 - i / n);
  const s = AC.createBufferSource(),
  f = AC.createBiquadFilter(),
  g = AC.createGain();
  f.type = 'lowpass';
  f.frequency.value = fr;
  g.gain.value = v;
  s.buffer = b;
  s.connect(f);
  f.connect(g);
  g.connect(mg);
  s.start()
}
const SFX = {
  hover:() => tone(900, .05, 'square', .03),
  click:() => {
    tone(300, .08, 'square', .08);
    tone(1100, .25, 'sine', .07, 0, .05)
  },
  back:() => tone(700, .25, 'sine', .1, - 500),
  swing:() => noise(.15, .15, 3500),
  hit:() => {
    noise(.15, .3, 900);
    tone(140, .15, 'sawtooth', .15, - 80)
  },
  crit:() => {
    tone(1600, .35, 'triangle', .15);
    tone(260, .12, 'square', .15);
    noise(.2, .3, 2500)
  },
  hurt:() => {
    tone(200, .3, 'sawtooth', .2, - 120);
    noise(.2, .3, 600)
  },
  die:() => {
    tone(180, .7, 'sawtooth', .2, - 150);
    noise(.5, .2, 500)
  },
  growl:() => {
    tone(70, .6, 'sawtooth', .18, 30);
    tone(75, .6, 'square', .08)
  },
  scare:() => {
    noise(.9, .5, 5000);
    tone(880, .8, 'sawtooth', .25, 300);
    tone(932, .8, 'sawtooth', .25, 300);
    tone(60, 1, 'square', .3)
  },
  pick:() => {
    tone(1200, .25, 'sine', .12);
    tone(1800, .3, 'sine', .1, 0, .08)
  },
  lvl:() =>[523, 659, 784, 1046].forEach((f, i) => tone(f, .4, 'triangle', .15, 0, i * .12)),
  door:() => {
    tone(90, .8, 'sawtooth', .08, 60);
    tone(50, .3, 'square', .2, 0, .8)
  },
  thunder:() => noise(1.6, .6, 300),
  heart:() => {
    tone(60, .12, 'sine', .45);
    tone(55, .12, 'sine', .35, 0, .17)
  },
  step:z => noise(.05, .07, z == 0 || z == 4?1500:z == 1 || z == 2?500:2500),
  howl:() => tone(380, 1.6, 'sine', .08, - 120),
  cricket:() => {
    for(let i = 0; i < 4; i++)tone(4200, .04, 'square', .01, 0, i * .08)
  }
};
