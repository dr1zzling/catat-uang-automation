from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import String, case, func, select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def get_transaction(db: Session, transaction_id: int) -> Transaction | None:
    return db.get(Transaction, transaction_id)


def get_history(
    db: Session,
    user_id: int,
    *,
    search: str | None = None,
    type: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Transaction], int]:
    """Riwayat transaksi user (terbaru dulu) + total jumlah data.

    Filter:
    - search: pencarian case-insensitive pada kolom description.
    - type: 'income' atau 'expense'.
    """
    stmt = select(Transaction).where(Transaction.user_id == user_id)

    if search:
        stmt = stmt.where(Transaction.description.ilike(f"%{search}%"))
    if type in ("income", "expense"):
        stmt = stmt.where(Transaction.type == type)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = db.execute(count_stmt).scalar_one()

    stmt = stmt.order_by(Transaction.created_at.desc().nullslast(), Transaction.id.desc())
    stmt = stmt.offset(skip).limit(limit)
    items = list(db.execute(stmt).scalars().all())
    return items, total


def create_transaction(db: Session, user_id: int, data: TransactionCreate) -> Transaction:
    transaction = Transaction(
        user_id=user_id,
        type=data.type,
        amount=data.amount,
        description=data.description,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction: Transaction, data: TransactionUpdate) -> Transaction:
    """Update hanya field yang dikirim (partial update)."""
    payload = data.model_dump(exclude_unset=True)
    for field, value in payload.items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction: Transaction) -> None:
    db.delete(transaction)
    db.commit()


def get_summary(db: Session, user_id: int) -> dict[str, Decimal]:
    """Total pemasukan, total pengeluaran, dan sisa saldo user."""
    income_stmt = (
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.user_id == user_id, Transaction.type == "income")
    )
    expense_stmt = (
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.user_id == user_id, Transaction.type == "expense")
    )

    total_income: Decimal = db.execute(income_stmt).scalar_one()
    total_expense: Decimal = db.execute(expense_stmt).scalar_one()
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
    }


def get_daily_chart(db: Session, user_id: int, *, days: int = 30) -> list[dict]:
    """Agregasi harian income/expense untuk grafik Recharts.

    Return list of dict: [{"date": date, "income": Decimal, "expense": Decimal}, ...]
    diurutkan dari tanggal paling lama ke terbaru.
    """
    start_date: date = (datetime.now() - timedelta(days=days)).date()

    income_expr = func.sum(
        case((Transaction.type == "income", Transaction.amount), else_=0)
    )
    expense_expr = func.sum(
        case((Transaction.type == "expense", Transaction.amount), else_=0)
    )
    day_expr = func.date(Transaction.created_at)

    stmt = (
        select(
            day_expr.label("date"),
            func.coalesce(income_expr, 0).label("income"),
            func.coalesce(expense_expr, 0).label("expense"),
        )
        .join(User, User.id == Transaction.user_id)
        .where(Transaction.user_id == user_id, day_expr >= start_date)
        .group_by(day_expr)
        .order_by(day_expr.asc())
    )

    rows = db.execute(stmt).all()
    return [
        {"date": row.date, "income": row.income, "expense": row.expense}
        for row in rows
    ]
