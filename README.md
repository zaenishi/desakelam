<<<<<<< HEAD
# Manuk_Piit
=======
# Malam Kelam di Desa Terkutuk — Struktur Pengembangan

Versi ini mempertahankan gameplay utama, tetapi struktur kode dibuat supaya lebih mudah dirawat dan dikembangkan.

## 1. Mulai dari mana?

Kalau ingin mengubah sesuatu, tidak perlu membuka semua file.

| Ingin mengubah | File |
|---|---|
| Ukuran canvas / dunia | `js/config.js` |
| Kode akses | `js/config.js` |
| Karakter | `js/config.js` |
| Achievement | `js/config.js` |
| Batas leaderboard | `js/config.js` |
| Database/cache | `js/database.js` |
| Profil, registrasi, ranking | `js/account.js` |
| Tampilan HTML | `index.html` |
| Warna/layout | `css/main.css` |
| Gerakan & input | `js/input.js` |
| Serangan | `js/combat.js` |
| AI monster | `js/monsters.js` |
| Update/game loop | `js/update.js` |
| Gambar/render canvas | `js/render.js` |
| Menu | `js/menu.js` dan `js/ui.js` |
| Skill karakter | `js/skills.js` |
| Sarang monster | `js/nests.js` |
| Malam berikutnya | `js/night.js` |
| Interior | `js/interiors.js` |
| Musik | `js/music.js` |
| Audio/SFX | `js/audio.js` |

## 2. CONFIG.JS

`js/config.js` adalah pusat konfigurasi.

Contoh menambah kode akses:

```js
const ACCESS_CODES = Object.freeze([
  'TURNAMEN26',
  'LEGENDA26',
  'KODEBARU26'
]);
```

Contoh mengubah batas leaderboard:

```js
leaderboard: {
  maxEntries: 500,
  displayEntries: 100
}
```

Contoh menambah karakter dilakukan di `CHARACTER_CLASSES`.

## 3. DATABASE

Gameplay tidak langsung berhubungan dengan IndexedDB.

Gameplay -> `MLDatabase` -> provider database.

Saat ini provider:

- IndexedDB sebagai database lokal
- localStorage sebagai cache cepat
- kompatibilitas dengan data versi lama

API utama:

- `MLDatabase.init()`
- `MLDatabase.getUser(uid)`
- `MLDatabase.saveUser(user)`
- `MLDatabase.login(uid)`
- `MLDatabase.submitScore(entry)`
- `MLDatabase.getLeaderboard()`

Nanti Firebase/Supabase dapat dibuat sebagai adapter tanpa membongkar gameplay.

## 4. Nama variabel

Nama global penting sudah dibuat lebih jelas, misalnya:

- `ME` -> `playerProfile`
- `CH` -> `CHARACTER_CLASSES`
- `LOC` -> `leaderboardCache`
- `selC` -> `selectedCharacterIndex`
- `saveME()` -> `savePlayerProfile()`
- `rankOf()` -> `getPlayerRank()`
- `doReg()` -> `submitRegistration()`
- `doGate()` -> `submitAccessCode()`
- `openRank()` -> `openRanking()`
- `openProf()` -> `openProfile()`

Properti profil juga dibuat jelas:

- `ch` -> `characterIndex`
- `best` -> `bestScore`
- `games` -> `gamesPlayed`
- `st` -> `stats`
- `ach` -> `achievements`
- `code` -> `accessCode`
- `skin` -> `skinUnlocked`

## 5. Kompatibilitas data lama

Data profil dan leaderboard versi sebelumnya tidak langsung dibuang.
Sistem melakukan normalisasi dari nama field lama ke nama field baru ketika data dibaca.

## 6. Urutan script

`config.js` harus dimuat sebelum `database.js` dan file game lain karena menjadi sumber konfigurasi global.
>>>>>>> cfbaf71 (Update game dan tambah assets)
# desakelam
