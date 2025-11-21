from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# --- User Models ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    role: str = "user"  # user, admin
    
    # Plan details
    current_plan_id: Optional[str] = None
    plan_expires_at: Optional[datetime] = None
    
    # Renewal
    renewal_notice_sent_at: Optional[datetime] = None
    
    model_config = ConfigDict(extra="ignore")

class UserResponse(UserBase):
    id: str
    created_at: datetime
    role: str
    current_plan_id: Optional[str] = None
    plan_expires_at: Optional[datetime] = None
    renewal_notice_sent_at: Optional[datetime] = None

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

# --- Category Models ---
class CategoryBase(BaseModel):
    name: str
    color: str = "#000000"

class CategoryCreate(CategoryBase):
    pass

class CategoryInDB(CategoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(extra="ignore")

class CategoryResponse(CategoryInDB):
    pass

# --- Button Models ---
class ButtonBase(BaseModel):
    original_url: str
    title: Optional[str] = None
    category_id: Optional[str] = None # Changed from category string to ID

class ButtonCreate(ButtonBase):
    pass

class ButtonUpdate(BaseModel):
    title: Optional[str] = None
    icon_url: Optional[str] = None
    category_id: Optional[str] = None
    is_favorite: Optional[bool] = None # Added favorite

class ButtonInDB(ButtonBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    icon_url: str
    is_favorite: bool = False # Added favorite
    click_count: int = 0 # Added stats
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(extra="ignore")

class ButtonResponse(ButtonInDB):
    pass

# --- Plan Models ---
class PlanBase(BaseModel):
    name: str
    description: str
    price: float
    button_limit: int # -1 for unlimited
    duration_days: int = 30

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    price: Optional[float] = None
    description: Optional[str] = None
    button_limit: Optional[int] = None

class PlanInDB(PlanBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    model_config = ConfigDict(extra="ignore")

class PlanResponse(PlanInDB):
    pass

# --- Payment Models ---
class PaymentBase(BaseModel):
    plan_id: str

class PaymentCreate(PaymentBase):
    pass

class PaymentInDB(PaymentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    receipt_url: str
    status: str = "pending" # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(extra="ignore")

class PaymentResponse(PaymentInDB):
    user_email: Optional[str] = None
    plan_name: Optional[str] = None
