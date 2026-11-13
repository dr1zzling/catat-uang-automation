from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TransactionType = Literal["income", "expense"]

# Batas amount sesuai spesifikasi: 0 < amount <= 999_999_999
AMOUNT_FIELD = Field(..., gt=0, le=999_999_999, description="Nominal harus > 0 dan <= 999999999")


class TransactionCreate(BaseModel):
    user_id: int
    type: TransactionType
    amount: Decimal = AMOUNT_FIELD
    description: str | None = None


class TransactionUpdate(BaseModel):
    """Semua field opsional; hanya yang dikirim yang akan diubah."""

    type: TransactionType | None = None
    amount: Decimal | None = Field(default=None, gt=0, le=999_999_999)
    description: str | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    type: TransactionType
    amount: Decimal
    description: str | None = None
    created_at: datetime | None = None


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int


class SummaryResponse(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal


class ChartPoint(BaseModel):
    date: date
    income: Decimal
    expense: Decimal
