from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LoginRequest(BaseModel):
    """Payload POST /api/auth/login."""

    phone_number: str = Field(..., min_length=1, description="Nomor HP, contoh: 628000000000")

    @field_validator("phone_number")
    @classmethod
    def normalize_phone_number(cls, value: str) -> str:
        """Terima format 08..., 8..., atau 62..., lalu simpan sebagai 62..."""
        digits = "".join(character for character in value if character.isdigit())
        if digits.startswith("0"):
            digits = f"62{digits[1:]}"
        elif digits.startswith("8"):
            digits = f"62{digits}"
        if not digits:
            raise ValueError("Nomor WhatsApp tidak valid.")
        return digits


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone_number: str
    name: str | None = None
    created_at: datetime | None = None
