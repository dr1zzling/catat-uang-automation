import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Muat file .env dari root folder backend (jika ada)
load_dotenv()


class Settings(BaseSettings):
    """Konfigurasi aplikasi, dibaca dari environment variable / file .env."""

    APP_NAME: str = "Catat Uang API"
    DEBUG: bool = False

    # Contoh: postgresql://user:password@host:5432/dbname
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/catat_uang"

    # Daftar origin frontend (React/Vite) yang diizinkan, dipisah koma
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


# Izinkan override dari environment variable asli (mis. yang diset docker/systemd)
settings = Settings(
    _env_file=None,
    APP_NAME=os.getenv("APP_NAME", "Catat Uang API"),
    DEBUG=os.getenv("DEBUG", "false").lower() == "true",
    DATABASE_URL=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/catat_uang"),
    CORS_ORIGINS=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"),
)
