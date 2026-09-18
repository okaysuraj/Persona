from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    display_name: str = Field(..., min_length=2, max_length=100)
    timezone: Optional[str] = "UTC"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    display_name: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    timezone: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
