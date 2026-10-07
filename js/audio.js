/* ===== AUDIO (Web Audio, sintetis) ===== */
let audioContext = null, musicGain, droneGain;
function au() {
  try {
    if (!audioContext) {
      audioContext = new(window.AudioContext || window.webkitAudioContext)();
      musicGain = audioContext.createGain();
      musicGain.gain.value =.6;
      musicGain.connect(audioContext.destination);
      const o = audioContext.createOscillator(),
      l = audioContext.createOscillator(),
      lg = audioContext.createGain();
      droneGain = audioContext.createGain();
      droneGain.gain.value =.05;
      o.type = 'sawtooth';
      o.frequency.value = 48;
      l.frequency.value =.15;
      lg.gain.value = 10;
      l.connect(lg);
      lg.connect(o.frequency);
      o.connect(droneGain);
      droneGain.connect(musicGain);
      o.start();
      l.start()
    }
    if (audioContext.state == 'suspended')audioContext.resume()
  } catch (e) {
    audioContext = null
  }
}
function tone(f, d, ty = 'sine', v =.2, sl = 0, dl = 0) {
  if (!audioContext)return;
  const o = audioContext.createOscillator(),
  g = audioContext.createGain(),
  n = audioContext.currentTime + dl;
  o.type = ty;
  o.frequency.setValueAtTime(f,
  n);
  if (sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,
  f + sl),
  n + d);
  g.gain.setValueAtTime(v,
  n);
  g.gain.exponentialRampToValueAtTime(.001,
  n + d);
  o.connect(g);
  g.connect(musicGain);
  o.start(n);
  o.stop(n + d +.02)
}
function noise(d, v =.2, fr = 1000) {
  if (!audioContext)return;
  const n = audioContext.sampleRate * d | 0,
  b = audioContext.createBuffer(1,
  n,
  audioContext.sampleRate),
  a = b.getChannelData(0);
  for (let i = 0; i < n; i++)a[i] = (random() * 2 - 1) * (1 - i / n);
  const s = audioContext.createBufferSource(),
  f = audioContext.createBiquadFilter(),
  g = audioContext.createGain();
  f.type = 'lowpass';
  f.frequency.value = fr;
  g.gain.value = v;
  s.buffer = b;
  s.connect(f);
  f.connect(g);
  g.connect(musicGain);
  s.start()
}
const SFX = {
  hover: () => tone(900,
  .05,
  'square',
  .03),
  click: () => {
    tone(300,
    .08,
    'square',
    .08);
    tone(1100,
    .25,
    'sine',
    .07,
    0,
    .05)
  },
  back: () => tone(700,
  .25,
  'sine',
  .1,
  - 500),
  swing: () => noise(.15,
  .15,
  3500),
  hit: () => {
    noise(.15,
    .3,
    900);
    tone(140,
    .15,
    'sawtooth',
    .15,
    - 80)
  },
  crit: () => {
    tone(1600,
    .35,
    'triangle',
    .15);
    tone(260,
    .12,
    'square',
    .15);
    noise(.2,
    .3,
    2500)
  },
  hurt: () => {
    tone(200,
    .3,
    'sawtooth',
    .2,
    - 120);
    noise(.2,
    .3,
    600)
  },
  die: () => {
    tone(180,
    .7,
    'sawtooth',
    .2,
    - 150);
    noise(.5,
    .2,
    500)
  },
  growl: () => {
    tone(70,
    .6,
    'sawtooth',
    .18,
    30);
    tone(75,
    .6,
    'square',
    .08)
  },
  scare: () => {
    noise(.9,
    .5,
    5000);
    tone(880,
    .8,
    'sawtooth',
    .25,
    300);
    tone(932,
    .8,
    'sawtooth',
    .25,
    300);
    tone(60,
    1,
    'square',
    .3)
  },
  pick: () => {
    tone(1200,
    .25,
    'sine',
    .12);
    tone(1800,
    .3,
    'sine',
    .1,
    0,
    .08)
  },
  lvl: () => [523,
  659,
  784,
  1046].forEach((f,
  i) => tone(f,
  .4,
  'triangle',
  .15,
  0,
  i *.12)),
  door: () => {
    tone(90,
    .8,
    'sawtooth',
    .08,
    60);
    tone(50,
    .3,
    'square',
    .2,
    0,
    .8)
  },
  thunder: () => noise(1.6,
  .6,
  300),
  heart: () => {
    tone(60,
    .12,
    'sine',
    .45);
    tone(55,
    .12,
    'sine',
    .35,
    0,
    .17)
  },
  step: z => noise(.05,
  .07,
  z == 0 || z == 4 ? 1500: z == 1 || z == 2 ? 500: 2500),
  howl: () => tone(380,
  1.6,
  'sine',
  .08,
  - 120),
  cricket: () => {
    for (let i = 0; i < 4; i++)tone(4200,
    .04,
    'square',
    .01,
    0,
    i *.08)
  }
};
