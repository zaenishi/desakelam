# MALAM KELAM — DESA BERSIH
Demo karya Ekskul Komputer 4.0 untuk turnamen sekolah.

## Struktur penting
- `index.html` — halaman dan overlay UI.
- `css/main.css` — visual/menu/profile/shop/tournament.
- `js/config.js` — seluruh konfigurasi utama.
- `js/tournament.js` — ronde turnamen, timer, warning, pemenang, cinematic.
- `js/shop.js` — ekonomi + kuis edukasi 30 detik.
- `js/account.js` — profil, karakter, skor.
- `js/database.js` — IndexedDB/cache + Supabase opsional.
- `js/combat.js` — senjata dan combat.
- `js/render.js` — visual karakter/monster.

## Mengatur turnamen
Edit `GAME_CONFIG.tournament` di `js/config.js`.

Contoh:
```js
tournament: {
  enabled: true,
  enabledToday: true,
  date: '2026-10-10',
  days: null,
  startTime: '08:00',
  endTime: '15:00',
  warningMinutes: 1,
  countdownSeconds: 5,
  topWinners: 3,
  revealDelayMs: 2200,
  redirectToLeaderboard: true,
  requireAccessCode: true
}
```

- `date: null` berarti ronde mengikuti tanggal saat game dijalankan.
- `days: [1,2,3,4,5]` berarti hanya Senin–Jumat. Sistem memakai ISO weekday: Senin=1 ... Minggu=7.
- Jika turnamen aktif, leaderboard disembunyikan sampai ronde selesai.
- Ronde baru otomatis memakai `roundId` tanggal baru sehingga skor ronde sebelumnya tidak tercampur.

## Turnamen antar perangkat
Untuk demo satu perangkat, IndexedDB/cache sudah cukup.
Untuk turnamen sungguhan antar siswa/perangkat, isi:
`DATABASE_CONFIG.remote.supabase.url`
dan
`DATABASE_CONFIG.remote.supabase.anonKey`
di `js/config.js`, lalu jalankan `SUPABASE_SCHEMA.sql` pada project Supabase.

Tanpa backend remote, setiap browser memiliki leaderboard sendiri. Ini bukan bug; browser memang tidak dapat berbagi database lokal dengan perangkat lain.

## Kode akses
Kode berada di `ACCESS_CODES` pada `js/config.js`.

## Shop
- Uang hanya didapat dari kuis edukasi 30 detik.
- Jawaban benar memberi reward.
- Jawaban salah tidak memberi reward.
- Uang dapat dipakai untuk upgrade senjata dan skill.
- Level upgrade disimpan pada profile.

## Catatan karakter
Karakter dipilih saat registrasi dan tidak menyediakan opsi ganti karakter setelah akun dibuat. Setiap karakter memiliki senjata, efek basic attack, dan skill yang berbeda.

## Pemeriksaan
Seluruh file JavaScript pada release ini telah diperiksa dengan `node --check` dan tidak memiliki syntax error.
