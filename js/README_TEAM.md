# Malam Kelam — Team Structure

Versi ini sengaja memakai **baseline gameplay lama yang stabil**. Refactor dilakukan secara konservatif: modul gameplay/render tidak dibongkar total.

## Modul utama
- `js/config.js` — seluruh konfigurasi game.
- `js/database.js` — satu pintu untuk user/session/leaderboard. Saat migrasi ke Supabase/Firebase, pertahankan API `MLDatabase`.
- `js/account.js` — profile, login/session, ranking, achievement.
- `js/tournament.js` — jadwal, warning 1 menit, countdown, winner reveal.
- `js/fullscreen.js` — fullscreen + landscape.
- `js/skills.js` — skill dan cooldown.
- `js/ui.js` — navigasi/menu.
- `js/main.js` — game loop dan boot.

## Tournament
Atur di `GAME_CONFIG.tournament`:
```js
endTime: '16:30'
```

Matikan tournament:
```js
endTime: false
```
atau:
```js
enabledToday: false
```

Saat tournament mati, tombol menjadi `START` dan mode classic tetap dapat dipakai untuk mengumpulkan leaderboard.

## Session
Jika `uid + name + accessCode` sudah tersimpan, reload tidak meminta login ulang.

## Fullscreen / Landscape
Browser mobile tidak selalu mengizinkan fullscreen/orientation lock tanpa gesture. Karena itu versi ini:
1. mencoba otomatis pada tap pertama;
2. menyediakan tombol `FULLSCREEN` dan `LANDSCAPE` di intro;
3. menyediakan tombol yang sama di menu utama;
4. tetap menampilkan layar rotasi bila perangkat masih portrait.

## Realtime database
Gameplay jangan memanggil Supabase/Firebase secara langsung. Tambahkan adapter/provider di belakang API `MLDatabase`, sehingga `account.js`, `tournament.js`, dan gameplay tidak perlu dirombak ketika backend diganti.

Untuk turnamen produksi, server time dan validasi skor harus menjadi sumber kebenaran; waktu browser hanya fallback untuk versi lokal.
