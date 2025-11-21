from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# --- User Models ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    role: str = "user"  # user, admin
    
    model_config = ConfigDict(extra="ignore")

class UserResponse(UserBase):
    id: str
    created_at: datetime
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str
    confirm_new_password: str

# --- Button Models ---
class ButtonBase(BaseModel):
    original_url: str
    title: Optional[str] = None
    category: Optional[str] = None

class ButtonCreate(ButtonBase):
    pass

class ButtonUpdate(BaseModel):
    title: Optional[str] = None
    icon_url: Optional[str] = None
    category: Optional[str] = None

class ButtonInDB(ButtonBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    icon_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(extra="ignore")

class ButtonResponse(ButtonInDB):
    pass
