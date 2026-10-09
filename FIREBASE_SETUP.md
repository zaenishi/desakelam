# Pindah Database ke Firebase

Game memakai **IndexedDB (lokal)** secara default. Dengan Firebase (Firestore), leaderboard dan skor turnamen
**dibagi antar perangkat secara real-time**, sehingga juara turnamen dihitung dari semua pemain.
IndexedDB tetap dipakai sebagai cache/offline; jika Firebase gagal terhubung game otomatis memakai data lokal.

## Langkah singkat
1. <https://console.firebase.google.com> → **Add project**.
2. **Build → Firestore Database → Create database** (mode *production*, lokasi terdekat, mis. `asia-southeast2`).
3. **Project settings → General → Your apps → Web (`</>`)** → daftarkan app → salin objek `firebaseConfig`.
4. (Disarankan) **Build → Authentication → Sign-in method → Anonymous → Enable**.
5. Buka `js/config.js`:
   ```js
   const FIREBASE_CONFIG = {
     apiKey: '...', authDomain: '...', projectId: '...',
     storageBucket: '...', messagingSenderId: '...', appId: '...',
     useAnonymousAuth: true,   // true jika memakai rules di bawah
   };
   // ...
   const DATABASE_CONFIG = Object.freeze({ provider: 'firebase', ... });
   ```
6. **Firestore → Rules** → tempel rules di bawah → **Publish**.
7. Buka game. Di menu, pojok kanan bawah tertulis **☁ Firebase terhubung**. Jika tertulis
   *Mode lokal (Firebase gagal)*, arahkan kursor ke teks itu (atau buka Console browser) untuk melihat penyebabnya.

Kembali ke lokal kapan saja: ubah `provider` menjadi `'indexeddb'`.

## Rules yang disarankan (butuh Anonymous Auth aktif + `useAnonymousAuth: true`)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function validEntry(uid) {
      let d = request.resource.data;
      return d.uid == uid && d.name is string && d.name.size() <= 24
          && d.score is number && d.score >= 0 && d.score < 10000000;
    }
    match /users/{uid} {
      allow read, write: if signedIn();
    }
    match /leaderboard/{uid} {
      allow read: if true;
      allow create: if signedIn() && validEntry(uid);
      allow update: if signedIn() && validEntry(uid) && request.resource.data.score >= resource.data.score;
    }
    match /tournaments/{tid}/scores/{uid} {
      allow read: if true;
      allow create: if signedIn() && validEntry(uid);
      allow update: if signedIn() && validEntry(uid) && request.resource.data.score >= resource.data.score;
    }
  }
}
```
Untuk uji cepat saja (jangan dipakai saat lomba): `allow read, write: if true;` pada semua koleksi.

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
