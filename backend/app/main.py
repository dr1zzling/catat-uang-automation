from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, transactions
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cek koneksi database saat aplikasi start (tabel dibuat oleh bot WhatsApp)."""
    from sqlalchemy import text

    from app.core.database import engine

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"[startup] Berhasil terhubung ke database PostgreSQL")
    except Exception as exc:  # pragma: no cover
        print(f"[startup] Gagal terhubung ke database: {exc}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="REST API untuk aplikasi catat uang (terhubung ke DB bot WhatsApp).",
    version="1.0.0",
    lifespan=lifespan,
)

# ===== CORS: izinkan frontend React/Vite di localhost:5173 =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Daftarkan semua router di bawah prefix /api =====
app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")


@app.get("/", tags=["health"])
def root():
    return {"message": f"Selamat datang di {settings.APP_NAME}"}


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
