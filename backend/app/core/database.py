from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

def _ensure_psycopg2(url: str) -> str:
    """Paksa dialect psycopg2 (sesuai dependensi psycopg2-binary).

    SQLAlchemy default memakai psycopg3 untuk URL 'postgresql://',
    jadi kita ubah eksplisit menjadi 'postgresql+psycopg2://'.
    """
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


engine = create_engine(
    _ensure_psycopg2(settings.DATABASE_URL),
    pool_pre_ping=True,   # hindari koneksi "stale" yang sudah diputus PostgreSQL
    pool_size=5,
    max_overflow=10,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class untuk semua model ORM.

    Catatan: struktur tabel sudah dibuat oleh bot WhatsApp,
    jadi aplikasi ini TIDAK menjalankan create_all() — hanya memetakan
    tabel yang sudah ada di database.
    """


def get_db() -> Generator[Session, None, None]:
    """Dependency FastAPI: buka session DB baru per-request, tutup otomatis."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
