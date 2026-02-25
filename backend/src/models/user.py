from typing import Optional
from datetime import datetime, timezone, timedelta
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, DateTime
from pydantic import BaseModel

# Pakistan Standard Time (UTC+5)
PKT = timezone(timedelta(hours=5))

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)

class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    password_hash: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(PKT),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(PKT),
        sa_type=DateTime(timezone=True),
    )

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: UUID
    created_at: datetime

    @classmethod
    def from_orm(cls, user: User):
        return cls(
            id=user.id,
            email=user.email,
            created_at=user.created_at
        )