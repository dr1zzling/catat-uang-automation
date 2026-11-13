from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import db_session
from app.crud import transaction as transaction_crud
from app.crud import user as user_crud
from app.schemas.transaction import (
    ChartPoint,
    SummaryResponse,
    TransactionCreate,
    TransactionListResponse,
    TransactionResponse,
    TransactionUpdate,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _ensure_user_exists(db: Session, user_id: int) -> None:
    if not user_crud.get_user_by_id(db, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User dengan id {user_id} tidak ditemukan.",
        )


@router.get("/{user_id}/summary", response_model=SummaryResponse)
def get_summary(user_id: int, db: Session = Depends(db_session)):
    """Total pemasukan, total pengeluaran, dan sisa saldo user."""
    _ensure_user_exists(db, user_id)
    return transaction_crud.get_summary(db, user_id)


@router.get("/{user_id}/chart", response_model=list[ChartPoint])
def get_chart(
    user_id: int,
    days: int = Query(default=30, ge=1, le=365, description="Rentang hari ke belakang"),
    db: Session = Depends(db_session),
):
    """Data agregasi harian (income/expense) untuk grafik Recharts."""
    _ensure_user_exists(db, user_id)
    return transaction_crud.get_daily_chart(db, user_id, days=days)


@router.get("/{user_id}", response_model=TransactionListResponse)
def get_history(
    user_id: int,
    search: str | None = Query(default=None, description="Cari berdasarkan description"),
    type: str | None = Query(default=None, pattern="^(income|expense)$"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(db_session),
):
    """Riwayat transaksi user (urutan terbaru) dengan filter search & type."""
    _ensure_user_exists(db, user_id)
    items, total = transaction_crud.get_history(
        db, user_id, search=search, type=type, skip=skip, limit=limit
    )
    return TransactionListResponse(items=items, total=total)


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate, db: Session = Depends(db_session)):
    """Tambah transaksi baru.

    Validasi Pydantic: amount > 0 dan amount <= 999999999.
    Payload: { "user_id": 1, "type": "income"|"expense", "amount": 50000, "description": "..." }
    """
    _ensure_user_exists(db, payload.user_id)
    return transaction_crud.create_transaction(db, payload.user_id, payload)


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(db_session),
):
    """Edit data transaksi (partial update — hanya field yang dikirim)."""
    transaction = transaction_crud.get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaksi dengan id {transaction_id} tidak ditemukan.",
        )
    return transaction_crud.update_transaction(db, transaction, payload)


@router.delete("/{transaction_id}", status_code=status.HTTP_200_OK)
def delete_transaction(transaction_id: int, db: Session = Depends(db_session)):
    """Hapus transaksi berdasarkan ID."""
    transaction = transaction_crud.get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaksi dengan id {transaction_id} tidak ditemukan.",
        )
    transaction_crud.delete_transaction(db, transaction)
    return {"detail": f"Transaksi {transaction_id} berhasil dihapus."}

