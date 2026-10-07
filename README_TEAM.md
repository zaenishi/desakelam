# Malam Kelam — Team Architecture

## Struktur utama

```text
index.html
css/
  main.css

js/
  config.js                 # semua konfigurasi game
  database.js               # data-access layer
  database/providers/
    supabase.js             # provider Supabase opsional

  account.js                # profile, session, leaderboard
  tournament.js             # jadwal & penutupan turnamen
  skills.js                 # skill + cooldown
  fullscreen.js             # fullscreen + landscape

  core.js                   # state dasar
  data.js                   # data dunia/monster
  entities.js               # reset & entitas
  input.js                  # keyboard/touch
  update.js                 # game loop logic
  combat.js                 # combat
  monsters.js               # AI monster
  render.js                 # rendering
  ui.js                     # navigasi/menu
  menu.js                   # scene intro/menu
  end.js                    # menang/kalah
  ...
```

## Aturan pengembangan tim

### 1. Jangan akses database langsung dari gameplay

Jangan membuat:

```js
localStorage.getItem(...)
indexedDB.open(...)
fetch(...)
```

di `combat.js`, `update.js`, `render.js`, dll.

Gunakan:

```js
MLDatabase.getCurrentUser()
MLDatabase.saveUser(user)
MLDatabase.submitScore(entry)
MLDatabase.getLeaderboard()
```

Dengan pola ini database bisa diganti tanpa membongkar gameplay.

### 2. Konfigurasi hanya di `config.js`

Contoh mengaktifkan turnamen:

```js
tournament: {
  enabled: true,
  enabledToday: true,
  date: null,
  startTime: '00:00',
  endTime: '16:30'
}
```

Untuk membuat hari ini bukan turnamen:

```js
enabledToday: false
```

Untuk mematikan turnamen:

```js
enabled: false
```

Untuk mode tanpa batas waktu:

```js
endTime: false
```

Tombol otomatis berubah menjadi `START`.

### 3. UID tidak dibuat ulang

UID dibuat satu kali saat registrasi.

Cache/session membuat reload halaman tidak meminta login/nama lagi selama profile masih tersedia.

### 4. Leaderboard

Mode sekarang:

- IndexedDB sebagai database lokal.
- localStorage sebagai cache cepat.
- leaderboard mempertahankan skor terbaik.
- provider Supabase tersedia sebagai jalur migrasi realtime.

Untuk ratusan pemain sungguhan, gunakan Supabase/Firebase sebagai sumber utama dan anggap local cache hanya sebagai cache.

### 5. Supabase

Ubah di `js/config.js`:

```js
provider: 'supabase'
```

dan:

```js
DATABASE_CONFIG.remote.supabase.url = 'https://PROJECT.supabase.co'
DATABASE_CONFIG.remote.supabase.anonKey = '...'
```

Jangan memasukkan `service_role` key ke frontend.

Gunakan RLS di Supabase.

### 6. Turnamen

Pada `16:29` dengan `endTime: '16:30'`:

```text
SISA WAKTU 1 MENIT
```

Pada detik terakhir:

```text
3
2
1
WAKTU HABIS
```

Kemudian:

```text
PEMENANG NO 1
NAMA

PEMENANG NO 2
NAMA

PEMENANG NO 3
NAMA
```

dan user diarahkan ke Ranking.

## Catatan penting untuk production

Waktu turnamen saat ini menggunakan waktu lokal browser.

Untuk turnamen resmi, server harus menjadi sumber waktu dan sumber kebenaran skor. Client hanya menampilkan timer.

Solusi production yang disarankan:

1. Server menentukan `tournament_start_at` dan `tournament_end_at`.
2. Server memvalidasi submission score.
3. Server menyimpan skor dengan user ID unik.
4. Leaderboard realtime berasal dari server.
5. Client hanya menerima snapshot leaderboard.
6. Tutup turnamen berdasarkan server timestamp, bukan jam HP pemain.
