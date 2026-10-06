/* ===== DASAR ===== */
const $ = s => document.querySelector(s);
const C = $('#c');
const X = C.getContext('2d');
const W = GAME_CONFIG.canvas.width;
const H = GAME_CONFIG.canvas.height;
const R = Math.random;
const PI = Math.PI;

let WW = GAME_CONFIG.world.width;
let WH = GAME_CONFIG.world.height;

const cl     = (v, a, b) => Math.max(a, Math.min(b, v));
const dist   = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angd   = (a, b) => ((a - b + 3 * PI) % (2 * PI)) - PI;
const ci     = (x, y, r, c) => { X.fillStyle = c; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill(); };

const touch = matchMedia('(pointer:coarse)').matches;
if (touch) document.body.classList.add('touch');

/* ---------- State global ---------- */
let S = 'intro';               // state: intro | play | pause | end | menu | load
let MODE = 'classic';          // 'classic' | 'train'
let t = 0, last = 0;
let shake = 0, hitstop = 0, slow = 1, flash = 0;
let cam = { x: 0, y: 0 };
let it = 0;                    // intro timer
let I = {};                    // instance timer
let sc = null;                 // scare state
let msg = null;                // pesan overlay

/* ---------- Entitas ---------- */
let P;                         // player
let M = [];                    // monsters
let IT = [];                   // items
let PR = [];                   // projectiles
let FX = [];                   // effects
let TX = [];                   // floating text
let OB = [];                   // obstacles
let DC = [];                   // decor
let NS = [];                   // monster nests
let gt = 0;                    // game time
let wave = 0;
let wT = 0;
let tr = 0;                    // training step
let score = 0;
let weather = 'clear';
let wTm = 0;
let boss = 0;
let fireflies = [];
let rain = [];

/* ---------- Interiors ---------- */
let INR = 0;                   // in-room flag
let OUT = null;                // saved outside state
let ROOM = null;               // current room data
let FD = 0;                    // fade value

const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };