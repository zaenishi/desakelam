# Malam Kelam di Desa Terkutuk — v5 (Edisi Turnamen & Edukasi Lingkungan)

Buka `index.html` (disarankan lewat server lokal, mis. `python3 -m http.server`). Tanpa build step.

## Struktur
| File | Fungsi |
|---|---|
| `js/config.js` | **Semua pengaturan** (turnamen, kode akses, karakter, shop-kuis) |
| `js/edudata.js` | Harga upgrade/senjata & bank soal pengetahuan |
| `js/state.js` | UI state machine (`UI.set(...)`) + `createScope()` pembersih timer/listener |
| `js/tournament.js` | Fase turnamen, timer, pop-up, hitung mundur, urutan akhir, reset sesi |
| `js/economy.js` | `Economy` (koin) & `Loadout` (upgrade skill + senjata) — satu-satunya pintu ubah koin |
| `js/account.js` | Profil, skor, achievement, kode akses |
| `js/database.js` | IndexedDB (cache lokal) + lapisan remote; store `tournament` (skor khusus turnamen) |
| `js/db-firebase.js` | Adapter Firestore (aktif bila `provider: 'firebase'`) — lihat `FIREBASE_SETUP.md` |
| `js/sprites.js` | Karakter 2D prosedural + preview senjata/skill |
| `js/combat.js`, `skills.js` | Serangan & skill unik per karakter, stun |
| `js/cinematic.js` | Sinematik "Desa Kelam menjadi cerah" |
| `js/ui*.js`, `css/main.css`, `index.html` | Layar: menu, profil, pilih karakter, leaderboard, shop |

## Mengatur turnamen (`js/config.js` → `GAME_CONFIG.tournament`)
- `active`: `true/false`
- `mode: "time"` → jendela harian `startTime`–`endTime` (jam lokal perangkat)
- `mode: "date"` → berakhir pada `targetDate`
- `mode: "session"` → timer `durationMinutes` dimulai saat START pertama (tambahan, cocok untuk uji coba)
- `accessCodeRequired`: wajib kode akses atau tidak (kode di `ACCESS_CODES`)

## Aturan state UI
`body[data-ui]` diisi oleh `UI.set()`. CSS menampilkan kontrol gameplay (`#tc`, `#pb`, `#bI`) **hanya** saat `GAMEPLAY`.
Setiap layar memakai `scope.on/interval/timeout/raf` sehingga semuanya dibuang otomatis saat pindah layar.

## Database
Default: lokal (IndexedDB, per perangkat). Untuk leaderboard/turnamen lintas perangkat ikuti `FIREBASE_SETUP.md`
(isi `FIREBASE_CONFIG`, ubah `DATABASE_CONFIG.provider` ke `'firebase'`). Gagal terhubung → otomatis kembali ke lokal.

## Batasan yang perlu diketahui
- Waktu turnamen memakai jam perangkat pemain.
- Skor dikirim dari browser sehingga dapat dipalsukan oleh yang paham teknis (lihat `FIREBASE_SETUP.md`).
