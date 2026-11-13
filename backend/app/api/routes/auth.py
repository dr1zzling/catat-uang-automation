from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import db_session
from app.crud import user as user_crud
from app.schemas.auth import LoginRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, db: Session = Depends(db_session)):
    """Login via nomor HP.

    - Jika nomor terdaftar di tabel `users` -> kembalikan data user.
    - Jika tidak -> 404 dengan pesan user belum terdaftar.
    """
    user = user_crud.get_user_by_phone(db, payload.phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User belum terdaftar. Daftar terlebih dahulu melalui bot WhatsApp.",
        )
    return user
