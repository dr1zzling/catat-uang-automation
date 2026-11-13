# Arah desain Catat Uang

Dibaca sebagai: dashboard keuangan pribadi untuk pengguna bot WhatsApp di Indonesia, dengan bahasa visual buku kas editorial yang tenang, dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

## Identitas

Catat Uang adalah alat harian, bukan aplikasi yang perlu menjual dirinya. Arah visualnya meniru buku kas yang rapi: permukaan hangat, garis tipis, angka besar yang mudah dipindai, dan satu aksen hijau untuk tindakan utama. Tidak ada ilustrasi dekoratif, grafik palsu, atau angka contoh.

## Palet

| Peran | Terang | Gelap |
| --- | --- | --- |
| Latar halaman | `#f5f2e9` | `#0c1210` |
| Permukaan kartu | `#fcfaf5` | `#131a16` |
| Teks utama | `#16211b` | `#eef3ef` |
| Teks sekunder | `#5a6a61` | `#a3b2a8` |
| Aksen tindakan | `#0c6b45` | `#4cd99a` |
| Pemasukan | `#0a5a36` di `#e4f0e7` | `#6fe0a8` di `#10281c` |
| Pengeluaran | `#97322b` di `#f8e8e4` | `#ff9d92` di `#2b1714` |
| Saldo | `#1e405c` di `#e7eef5` | `#a9cbe8` di `#12212b` |

Hijau dan merah dipakai karena maknanya di konteks uang, bukan sebagai dekorasi. Aksen hijau hanya muncul pada tindakan utama dan fokus.

## Tipografi

Plus Jakarta Sans Variable dipilih karena dirancang untuk konteks Indonesia, ramah dibaca di ukuran kecil, dan memiliki angka yang jelas. Semua nominal memakai `tabular-nums` agar kolom angka sejajar.

## Layout

- Saldo adalah fokus utama: kartunya lebih lebar dan angkanya paling besar.
- Pemasukan dan pengeluaran menjadi pendukung, bukan tiga kartu identik.
- Grafik dan riwayat disusun vertikal mengikuti alur membaca: ringkasan, pola, lalu detail.
- Di layar kecil, tabel berubah menjadi daftar kartu agar tidak ada gulir horizontal.

## Keputusan dan alasan

- Latar hangat, bukan putih atau gradasi biru: meniru kertas buku kas dan membedakan produk dari dashboard generik.
- Satu aksen hijau: tindakan utama mudah ditemukan tanpa mewarnai semua elemen.
- Kartu saldo dominan: pertanyaan pertama pengguna adalah "sisa uang saya berapa".
- Tema terang dan gelap: pengguna memantau keuangan pagi dan malam, jadi keduanya disediakan dan diuji.
- Gerak hanya berupa transisi hover, buka dialog, dan notifikasi: tidak ada animasi berulang yang mengalihkan perhatian.
- Ikon diambil dari makna transaksi (masuk, keluar, dompet, hapus), bukan hiasan.

## Yang sengaja tidak dipakai

Gradasi dekoratif, kaca/blur, bento grid, angka statistik karangan, testimoni, logo klien, pita warna di tepi kartu, dan animasi tanpa akhir.
