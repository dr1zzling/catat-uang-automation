# Catat Uang

Dashboard keuangan pribadi untuk pengguna bot WhatsApp "Catat Uang". Repositori ini berisi dua aplikasi: REST API (FastAPI + PostgreSQL) yang membaca database milik bot, dan dashboard React untuk melihat, menambah, mengedit, serta menghapus transaksi.

Skema tabel (`users`, `transactions`) dibuat dan diisi oleh bot WhatsApp di luar repositori ini. API hanya memetakan tabel yang sudah ada — tidak menjalankan migrasi atau `create_all()`.

```mermaid
flowchart LR
    B[Bot WhatsApp] -->|menulis| DB[(PostgreSQL)]
    DB -->|dibaca API| A[FastAPI :8000]
    A -->|JSON REST| F[React Dashboard :5173]
```

## Fitur

- Login dengan nomor WhatsApp; nomor `08...`/`8...` dinormalkan ke `62...`.
- Ringkasan pemasukan, pengeluaran, dan saldo dengan filter Bulan Ini, Bulan Lalu, dan Semua Waktu.
- Grafik arus kas harian (Recharts) dan agregasi bulanan untuk rentang "Semua Waktu".
- Riwayat transaksi dengan pencarian, filter tipe, pagination, tambah/edit/hapus lewat modal.
- Tema terang/gelap dan penyesuaian tampilan untuk layar kecil.
- Status kosong, loading, error, dan notifikasi hasil aksi.

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy 2, Pydantic 2, psycopg2, uvicorn |
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7, Axios, Recharts, Lucide |
| Database | PostgreSQL (dimiliki bot WhatsApp) |
| Deploy frontend | Vercel (SPA rewrite sudah disiapkan di `frontend/vercel.json`) |

## Struktur

```text
.
├── backend/
│   ├── app/
│   │   ├── api/routes/     # auth.py, transactions.py
│   │   ├── core/           # config.py, database.py
│   │   ├── crud/           # query database
│   │   ├── models/         # pemetaan tabel users & transactions
│   │   ├── schemas/        # validasi request/response
│   │   └── main.py         # inisialisasi app, CORS, health check
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/     # kartu, grafik, tabel, modal, dll.
    │   ├── context/        # AuthContext, ThemeContext
    │   ├── hooks/          # useDashboardData
    │   ├── lib/            # format angka & periode
    │   ├── pages/          # LoginPage, DashboardPage
    │   └── services/api.js # klien Axios
    ├── .env.example
    ├── DESIGN.md           # arah desain & keputusan visual
    ├── README.md           # detail halaman dan perilaku frontend
    └── vercel.json
```

## Menjalankan secara lokal

Prasyarat: Python 3.10+, Node.js 20+, dan PostgreSQL yang sudah dipakai bot WhatsApp.

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # lalu sesuaikan DATABASE_URL & CORS_ORIGINS
uvicorn app.main:app --reload --port 8000
```

Dokumentasi API interaktif: `http://localhost:8000/docs`. Health check: `GET http://localhost:8000/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env             # ubah VITE_API_BASE_URL jika API tidak di localhost:8000
npm run dev
```

Buka `http://localhost:5173`, lalu login dengan nomor WhatsApp yang sudah terdaftar. Jika belum terdaftar, kirim `DAFTAR#Nama` ke bot WhatsApp terlebih dahulu.

## Konfigurasi

`backend/.env`

| Variabel | Contoh | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/catat_uang` | Diubah ke `postgresql+psycopg2://` otomatis oleh `database.py` |
| `APP_NAME` | `Catat Uang API` | Judul dokumen OpenAPI |
| `DEBUG` | `True` | Jika aktif, SQLAlchemy mencetak query ke log |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Daftar origin frontend, dipisah koma |

`frontend/.env`

| Variabel | Contoh | Keterangan |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | URL dasar API, tanpa garis miring di akhir |

## Endpoint API

Semua endpoint diawali prefiks `/api`.

| Metode | Path | Keterangan |
| --- | --- | --- |
| `POST` | `/auth/login` | Cari user by nomor WhatsApp; `404` jika belum terdaftar |
| `GET` | `/transactions/{user_id}/summary` | Total pemasukan, pengeluaran, saldo |
| `GET` | `/transactions/{user_id}/chart?days=30` | Agregasi harian (`1`–`365` hari) |
| `GET` | `/transactions/{user_id}?search=&type=&skip=&limit=` | Riwayat terbaru, `limit` maks. 200 |
| `POST` | `/transactions/` | Tambah transaksi (`user_id`, `type`, `amount`, `description`) |
| `PUT` | `/transactions/{id}` | Update sebagian field |
| `DELETE` | `/transactions/{id}` | Hapus transaksi |

`type` bernilai `income` atau `expense`. Nominal harus `0 < amount <= 999999999`.

## Deployment

- Frontend: import repositori ke Vercel dengan **Root Directory** `frontend`. `vercel.json` sudah meneruskan rute SPA ke `index.html` tanpa mengganggu aset dan favicon. Set `VITE_API_BASE_URL` di environment variable Vercel.
- Backend: jalankan `uvicorn app.main:app` di host Python (atau container) dengan `DATABASE_URL` produksi. Tambahkan domain frontend produksi ke `CORS_ORIGINS`.

## Catatan

- Backend belum menerbitkan token sesi. Proteksi halaman dashboard masih berupa pengecekan `localStorage` di sisi klien — tambahkan autentikasi token di backend sebelum dipakai untuk data sensitif atau produksi.
- Riwayat dimuat 200 data per permintaan sampai seluruh total terbaca. Filter periode, pencarian, dan tipe dihitung di klien supaya kartu, grafik, dan tabel tetap konsisten.
- Detail perilaku halaman ada di [`frontend/README.md`](frontend/README.md); alasan di balik pilihan warna, tipografi, dan layout ada di [`frontend/DESIGN.md`](frontend/DESIGN.md).
