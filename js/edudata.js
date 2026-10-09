/*
 * ============================================================
 * EDUDATA.JS — DATA EDUSHOP (item, upgrade, bank soal)
 * ============================================================
 * Ubah harga / efek di sini tanpa menyentuh logika toko.
 */

/* Upgrade bertingkat: efek berlaku pada SKILL karakter yang dipakai. */
const SHOP_UPGRADES = Object.freeze([
  { id: 'cd',  icon: '⏱️', name: 'Pemulihan Cepat', desc: 'Cooldown skill -8% per level', max: 5, prices: [60, 90, 130, 180, 250], per: .08 },
  { id: 'pow', icon: '💥', name: 'Kekuatan Skill',  desc: 'Damage & heal skill +12% per level', max: 5, prices: [70, 100, 140, 190, 260], per: .12 },
  { id: 'dur', icon: '⏳', name: 'Efek Bertahan',   desc: 'Durasi stun/kebal/rage +12% per level', max: 5, prices: [50, 80, 120, 170, 230], per: .12 },
  { id: 'rng', icon: '🎯', name: 'Jangkauan Skill', desc: 'Radius skill +8% per level', max: 5, prices: [50, 80, 120, 170, 230], per: .08 }
]);

/* Senjata unik: sekali beli, bisa dipasang bergantian. Berlaku untuk serangan dasar semua karakter. */
const SHOP_WEAPONS = Object.freeze([
  { id: 'basic',    icon: '🗡️', name: 'Senjata Dasar',          desc: 'Senjata bawaan karakter.', price: 0,   dmg: 1,    range: 1,    rate: 1,    color: null },
  { id: 'sapu',     icon: '🧹', name: 'Sapu Lidi Sakti',        desc: '+8% damage, +8% kecepatan serang.', price: 80,  dmg: 1.08, range: 1,    rate: .92,  color: '#d9b36a' },
  { id: 'daur',     icon: '♻️', name: 'Pedang Daur Ulang',      desc: '+15% damage. Tebasan hijau.', price: 180, dmg: 1.15, range: 1,    rate: 1,    color: '#5fe36a' },
  { id: 'penjepit', icon: '🦾', name: 'Penjepit Sampah Raksasa', desc: '+25% jangkauan serangan.', price: 260, dmg: 1,    range: 1.25, rate: 1,    color: '#7fd0ff' },
  { id: 'kompos',   icon: '🔨', name: 'Palu Kompos',            desc: '+30% damage, serangan 10% lebih lambat.', price: 350, dmg: 1.3,  range: 1,    rate: 1.1,  color: '#c97b3d' },
  { id: 'surya',    icon: '☀️', name: 'Bilah Cahaya Surya',     desc: '+25% damage & +10% jangkauan.', price: 420, dmg: 1.25, range: 1.1,  rate: 1,    color: '#ffd54a' }
]);

/* Bank soal pengetahuan dasar (jawaban benar selalu indeks 0, diacak saat ditampilkan). */
const QUIZ_KNOWLEDGE = Object.freeze([
  ['Planet terbesar di tata surya adalah…', ['Jupiter', 'Saturnus', 'Mars', 'Bumi'], 'Jupiter adalah planet terbesar.'],
  ['Gas yang kita hirup untuk bernapas adalah…', ['Oksigen', 'Nitrogen', 'Karbon dioksida', 'Helium'], 'Tubuh memakai oksigen untuk bernapas.'],
  ['Proses tumbuhan membuat makanan dengan bantuan cahaya matahari disebut…', ['Fotosintesis', 'Respirasi', 'Evaporasi', 'Kondensasi'], 'Fotosintesis terjadi di daun.'],
  ['Bagian tumbuhan yang menyerap air dari tanah adalah…', ['Akar', 'Daun', 'Bunga', 'Batang'], 'Akar menyerap air dan mineral.'],
  ['Air membeku pada suhu…', ['0 °C', '50 °C', '100 °C', '-50 °C'], 'Titik beku air adalah 0 °C.'],
  ['Alat untuk mengukur suhu adalah…', ['Termometer', 'Barometer', 'Penggaris', 'Neraca'], 'Termometer mengukur suhu.'],
  ['Hewan yang berkembang biak dengan bertelur adalah…', ['Ayam', 'Kucing', 'Sapi', 'Kambing'], 'Ayam termasuk hewan ovipar.'],
  ['Lambang negara Indonesia adalah…', ['Garuda Pancasila', 'Burung Merpati', 'Harimau', 'Banteng'], 'Lambang negara adalah Garuda Pancasila.'],
  ['Sila pertama Pancasila berbunyi…', ['Ketuhanan Yang Maha Esa', 'Persatuan Indonesia', 'Kemanusiaan yang adil dan beradab', 'Keadilan sosial'], 'Sila ke-1: Ketuhanan Yang Maha Esa.'],
  ['Proklamasi kemerdekaan Indonesia dibacakan pada tanggal…', ['17 Agustus 1945', '1 Juni 1945', '28 Oktober 1928', '10 November 1945'], '17 Agustus 1945.'],
  ['Proklamator kemerdekaan Indonesia adalah…', ['Soekarno dan Hatta', 'Diponegoro dan Hatta', 'Soekarno dan Sudirman', 'Hatta dan Sjahrir'], 'Soekarno dan Mohammad Hatta.'],
  ['Besar sudut siku-siku adalah…', ['90°', '45°', '180°', '360°'], 'Sudut siku-siku = 90°.'],
  ['Hasil dari 1/2 + 1/4 adalah…', ['3/4', '2/6', '1/6', '2/4'], '1/2 = 2/4, sehingga 2/4 + 1/4 = 3/4.'],
  ['Bilangan biner 1 + 1 hasilnya…', ['10', '2', '11', '0'], 'Dalam biner, 1 + 1 = 10.'],
  ['Satu byte terdiri dari berapa bit?', ['8', '4', '16', '2'], '1 byte = 8 bit.'],
  ['Singkatan CPU adalah…', ['Central Processing Unit', 'Computer Power Unit', 'Central Print Unit', 'Core Program Utility'], 'CPU adalah otak komputer.'],
  ['Perangkat berikut yang termasuk alat INPUT adalah…', ['Keyboard', 'Monitor', 'Speaker', 'Printer'], 'Keyboard memasukkan data ke komputer.'],
  ['Pintasan keyboard Ctrl + C berfungsi untuk…', ['Menyalin', 'Menempel', 'Memotong', 'Mencetak'], 'Ctrl + C = copy (salin).'],
  ['Pintasan keyboard Ctrl + V berfungsi untuk…', ['Menempel', 'Menyalin', 'Menyimpan', 'Membatalkan'], 'Ctrl + V = paste (tempel).'],
  ['HTML digunakan untuk membuat…', ['Struktur halaman web', 'Gambar 3D', 'Basis data', 'Sistem operasi'], 'HTML menyusun struktur halaman web.'],
  ['Tong sampah berwarna hijau umumnya untuk sampah…', ['Organik', 'Plastik', 'Berbahaya (B3)', 'Kaca'], 'Hijau = sampah organik (sisa makanan, daun).'],
  ['Tong sampah berwarna kuning umumnya untuk sampah…', ['Anorganik (plastik, kaleng)', 'Organik', 'Medis', 'Elektronik'], 'Kuning = anorganik yang dapat didaur ulang.'],
  ['Prinsip 3R adalah Reduce, Reuse, dan…', ['Recycle', 'Remove', 'Repair', 'Return'], '3R: Reduce, Reuse, Recycle.'],
  ['Sisa sayur dan kulit buah termasuk sampah…', ['Organik', 'Anorganik', 'B3', 'Logam'], 'Sampah organik dapat dijadikan kompos.'],
  ['Baterai bekas termasuk sampah…', ['B3 (berbahaya)', 'Organik', 'Kertas', 'Kain'], 'Baterai mengandung zat berbahaya.'],
  ['Kantong plastik membutuhkan waktu untuk terurai selama…', ['Puluhan hingga ratusan tahun', 'Satu hari', 'Satu minggu', 'Satu bulan'], 'Plastik sangat sulit terurai.'],
  ['Hari Peduli Sampah Nasional diperingati setiap tanggal…', ['21 Februari', '17 Agustus', '22 April', '5 Juni'], 'HPSN diperingati 21 Februari.'],
  ['Hari Bumi diperingati setiap tanggal…', ['22 April', '21 Februari', '1 Mei', '25 Desember'], 'Hari Bumi: 22 April.'],
  ['Cara terbaik mengurangi sampah plastik adalah…', ['Membawa tas dan botol minum sendiri', 'Membakar plastik', 'Membuang ke sungai', 'Mengubur di halaman'], 'Reduce: kurangi pemakaian plastik sekali pakai.'],
  ['Membuang sampah ke sungai dapat menyebabkan…', ['Banjir dan pencemaran air', 'Air makin jernih', 'Ikan bertambah', 'Udara lebih segar'], 'Sampah menyumbat aliran dan mencemari air.'],
  ['Warna lampu lalu lintas yang berarti BERHENTI adalah…', ['Merah', 'Hijau', 'Kuning', 'Biru'], 'Merah = berhenti.'],
  ['Benda berikut yang dapat didaur ulang adalah…', ['Botol plastik bekas', 'Sisa nasi', 'Kulit pisang', 'Daun kering'], 'Botol plastik dapat diolah kembali.'],
  ['Hewan yang dikenal sebagai raja hutan adalah…', ['Singa', 'Kelinci', 'Kura-kura', 'Bebek'], 'Singa dijuluki raja hutan.'],
  ['Ibu kota provinsi tempat kamu tinggal paling dekat berarti…', ['Pusat pemerintahan provinsi', 'Pusat pemerintahan negara', 'Nama kecamatan', 'Nama sungai'], 'Ibu kota provinsi adalah pusat pemerintahan provinsi.']
]);
