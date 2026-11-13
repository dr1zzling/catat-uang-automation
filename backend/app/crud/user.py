from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_phone(db: Session, phone_number: str) -> User | None:
    """Cari user berdasarkan nomor HP (format tanpa '+', contoh: 628000000000)."""
    stmt = select(User).where(User.phone_number == phone_number)
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)
