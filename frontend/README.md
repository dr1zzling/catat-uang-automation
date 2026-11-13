# Catat Uang: Frontend Dashboard

Dashboard keuangan berbasis React untuk membaca data dari API Catat Uang (FastAPI + PostgreSQL milik bot WhatsApp).

## Stack

- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Recharts untuk grafik arus kas
- Lucide React untuk ikon
- Axios untuk pemanggilan API
- React Router untuk proteksi halaman

## Menjalankan

### 1. Backend

Dari folder `backend`, siapkan database PostgreSQL yang dipakai bot WhatsApp, lalu:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Dokumentasi API tersedia di `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173`.

Jika URL API berbeda, ubah `VITE_API_BASE_URL` di `.env`. Nilai bawaan:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Struktur folder

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── DESIGN.md
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── AppHeader.jsx
    │   ├── ConfirmDialog.jsx
    │   ├── EmptyState.jsx
    │   ├── FinanceChart.jsx
    │   ├── Modal.jsx
    │   ├── PeriodFilter.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── SummaryCard.jsx
    │   ├── SummaryCards.jsx
    │   ├── ThemeToggle.jsx
    │   ├── Toast.jsx
    │   ├── TransactionModal.jsx
    │   └── TransactionsPanel.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ThemeContext.jsx
    ├── hooks/
    │   └── useDashboardData.js
    ├── lib/
    │   ├── format.js
    │   └── period.js
    ├── pages/
    │   ├── DashboardPage.jsx
    │   └── LoginPage.jsx
    └── services/
        └── api.js
```

## Halaman dan perilaku

### `/login`

- Memasukkan nomor WhatsApp, memanggil `POST /api/auth/login`.
- Nomor `08...` atau `8...` dinormalkan menjadi `62...` sebelum dikirim.
- Data user disimpan di `localStorage` dengan kunci `catat-uang.user`.
- Jika nomor belum terdaftar (HTTP 404), tampil instruksi mengirim `DAFTAR#Nama` ke bot WhatsApp, lengkap dengan tombol salin format.

### `/`

Halaman dilindungi. Jika belum ada user di `localStorage`, pengguna diarahkan ke `/login`.

- Filter periode: Bulan Ini, Bulan Lalu, Semua Waktu.
- Tiga kartu ringkasan: pemasukan, pengeluaran, saldo.
- Grafik area Recharts untuk membandingkan pemasukan dan pengeluaran.
- Tabel riwayat dengan pencarian keterangan, filter tipe, pagination, edit, dan hapus dengan konfirmasi.
- Modal tambah/edit transaksi dengan validasi nominal `0 < nominal <= 999999999`.
- Tema terang/gelap tersimpan di `localStorage` dengan kunci `catat-uang.theme`.
- Empty state, loading skeleton, error state, dan notifikasi hasil aksi.

## Endpoint yang dipakai

| Fungsi | Endpoint |
| --- | --- |
| Login | `POST /api/auth/login` |
| Ringkasan | `GET /api/transactions/{user_id}/summary` |
| Riwayat | `GET /api/transactions/{user_id}` |
| Grafik harian | `GET /api/transactions/{user_id}/chart?days=30` |
| Tambah | `POST /api/transactions/` |
| Edit | `PUT /api/transactions/{transaction_id}` |
| Hapus | `DELETE /api/transactions/{transaction_id}` |

## Catatan data

- Riwayat diambil per halaman (200 data per permintaan) sampai seluruh total terbaca. Filter periode, pencarian, dan filter tipe dihitung di sisi klien agar hasil antar kartu, grafik, dan tabel selalu konsisten.
- Kartu ringkasan periode "Semua Waktu" memakai endpoint `/summary` sebagai sumber utama. Jika endpoint itu gagal, nilai dihitung dari riwayat yang sudah dimuat.
- Grafik "Semua Waktu" menampilkan agregasi bulanan 12 bulan terakhir. Kartu ringkasan tetap memakai total keseluruhan.
- Backend saat ini belum menerbitkan token sesi. Proteksi route hanya berlaku di sisi klien. Untuk produksi, tambahkan autentikasi token di backend.

## Perintah

```bash
npm run dev      # server pengembangan
npm run build    # build produksi
npm run preview  # pratinjau hasil build
```
