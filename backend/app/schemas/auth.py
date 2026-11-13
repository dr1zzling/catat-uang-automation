from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Payload POST /api/auth/login."""

    phone_number: str = Field(..., min_length=1, description="Nomor HP, contoh: 628000000000")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone_number: str
    name: str | None = None
    created_at: datetime | None = None
