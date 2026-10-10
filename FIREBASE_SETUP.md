# Pindah Database ke Firebase

Game memakai **IndexedDB (lokal)** secara default. Dengan Firebase (Firestore), leaderboard dan skor turnamen
**dibagi antar perangkat secara real-time**, sehingga juara turnamen dihitung dari semua pemain.
IndexedDB tetap dipakai sebagai cache/offline; jika Firebase gagal terhubung game otomatis memakai data lokal.

## Langkah singkat
1. <https://console.firebase.google.com> → **Add project**.
2. **Build → Firestore Database → Create database** (mode *production*, lokasi terdekat, mis. `asia-southeast2`).
3. **Project settings → General → Your apps → Web (`</>`)** → daftarkan app → salin objek `firebaseConfig`.
4. (Opsional) **Build → Authentication → Sign-in method → Anonymous → Enable** bila memakai Opsi B.
5. Buka `js/config.js`:
   ```js
   const FIREBASE_CONFIG = {
     apiKey: '...', authDomain: '...', projectId: '...',
     storageBucket: '...', messagingSenderId: '...', appId: '...',
     useAnonymousAuth: false,  // true hanya jika memakai Opsi B
   };
   // ...
   const DATABASE_CONFIG = Object.freeze({ provider: 'firebase', ... });
   ```
6. **Firestore → Rules** → tempel rules di bawah → **Publish**.
7. Buka game. Di menu, pojok kanan bawah tertulis **☁ Firebase terhubung**. Jika tertulis
   *Mode lokal (Firebase gagal)*, arahkan kursor ke teks itu (atau buka Console browser) untuk melihat penyebabnya.

Kembali ke lokal kapan saja: ubah `provider` menjadi `'indexeddb'`.

## Rules Firestore (pilih salah satu, lalu **Publish**)

### Opsi A — tanpa login (cocok dengan `useAnonymousAuth: false`, paling mudah)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function validEntry(uid) {
      let d = request.resource.data;
      return d.uid == uid && d.name is string && d.name.size() <= 24
          && d.score is number && d.score >= 0 && d.score < 10000000;
    }
    match /users/{uid} {
      allow read: if true;
      allow write: if request.resource.data.uid == uid;
    }
    match /leaderboard/{uid} {
      allow read: if true;
      allow create: if validEntry(uid);
      allow update: if validEntry(uid) && request.resource.data.score >= resource.data.score;
    }
    match /tournaments/{tid}/scores/{uid} {
      allow read: if true;
      allow create: if validEntry(uid);
      allow update: if validEntry(uid) && request.resource.data.score >= resource.data.score;
    }
  }
}
```

### Opsi B — dengan login anonim (`useAnonymousAuth: true` + Authentication → Anonymous aktif)
Sama seperti Opsi A, tetapi tambahkan `request.auth != null &&` di depan setiap kondisi `allow write/create/update`.

Untuk uji sangat cepat saja (jangan dipakai saat lomba): `allow read, write: if true;` pada semua koleksi.

> `apiKey` Firebase untuk web memang bukan rahasia (ikut terkirim ke browser). Keamanan data ditentukan oleh **rules** di atas,
> bukan oleh kerahasiaan apiKey.

## Jika tertulis "Mode lokal · Firebase gagal"
Ketuk teks status di menu (atau **Setelan → TES KONEKSI**). Game menampilkan langkah mana yang gagal beserta penyebabnya:

| Langkah gagal | Arti & solusi |
|---|---|
| Cek konfigurasi | `apiKey` / `projectId` belum diisi di `FIREBASE_CONFIG`. |
| Muat Firebase SDK | Internet mati atau jaringan memblokir `gstatic.com` / `jsdelivr.net`. Pakai SDK self-host lewat `sdkBaseUrl`. |
| Login anonim | Aktifkan Authentication → Sign-in method → Anonymous, atau set `useAnonymousAuth: false`. |
| Hubungi Firestore — `permission-denied` | Rules belum di-publish / menolak. Publish Opsi A di atas. Pastikan juga **Cloud Firestore API** aktif. |
| Hubungi Firestore — `not-found` | Database belum dibuat: Build → Firestore Database → **Create database**. |
| Hubungi Firestore — `timeout` / `unavailable` | Server tidak terjangkau. Penyebab tersering: Firestore Database **belum dibuat**, jaringan/ad-blocker memblokir `*.googleapis.com`, atau halaman dibuka lewat `file://`. Coba `forceLongPolling: true`, nonaktifkan ad-blocker, dan **hosting game lewat http(s)**. |
| Tulis: DITOLAK | Koneksi baca berhasil tetapi rules menolak tulis. Periksa rules (Opsi A) atau `useAnonymousAuth`. |

Koneksi berjalan di latar belakang: game **tidak menunggu** Firebase saat start, dan mencoba menyambung ulang otomatis
(10 → 20 → 40 → 60 detik). Skor yang dimainkan saat offline dikirim otomatis begitu tersambung.

## Hosting (sangat disarankan, terutama untuk Android)
Buka game dari alamat `https://…` (Firebase Hosting, GitHub Pages, Netlify, dsb.), bukan `file://`. Fullscreen/landscape, koneksi
Firestore, dan pemasangan ke Layar Utama bekerja jauh lebih andal lewat HTTPS.

## Struktur data
| Path | Isi |
|---|---|
| `users/{uid}` | cadangan profil pemain (koin, upgrade, statistik) |
| `leaderboard/{uid}` | skor terbaik umum |
| `tournaments/{tid}/scores/{uid}` | skor terbaik pemain **selama turnamen** (hanya naik) |

## Hal penting untuk turnamen multi-perangkat
- Gunakan `mode: "time"` atau `"date"`. Keduanya menghasilkan ID turnamen yang **sama di semua perangkat**.
  Mode `"session"` membuat ID per perangkat (hanya untuk uji coba satu perangkat).
- Waktu berakhir memakai **jam perangkat** masing-masing; pastikan jam semua perangkat akurat (aktifkan waktu otomatis).
- Saat turnamen berakhir, game menunggu data server terbaru (maks 4 detik) sebelum mengumumkan juara.
- Jaringan sekolah yang memblokir `gstatic.com`: unduh Firebase SDK compat v10 (app + firestore [+ auth]) ke folder
  sendiri dan isi `FIREBASE_CONFIG.sdkBaseUrl`, mis. `'js/vendor/firebase/'`.
- Skor dikirim dari browser sehingga **tetap bisa dipalsukan** oleh pemain yang paham teknis. Rules di atas hanya membatasi
  nilai yang tidak masuk akal. Untuk turnamen resmi, awasi peserta atau validasi skor lewat Cloud Functions.
