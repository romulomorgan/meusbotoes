from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import UserCreate, UserInDB, Token, UserResponse, PasswordResetRequest, PasswordResetConfirm
from app.security import get_password_hash, verify_password, create_access_token, decode_access_token
from datetime import timedelta, datetime
import os

router = APIRouter()

async def get_db():
    from server import db
    return db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_admin(current_user = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_password = get_password_hash(user.password)
    
    # Create user
    user_in_db = UserInDB(
        email=user.email,
        full_name=user.full_name,
        phone=user.phone, # Added phone
        hashed_password=hashed_password
    )
    
    user_doc = user_in_db.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    return user_in_db

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60 * 24) # 24 hours for prototype
    access_token = create_access_token(
        data={"sub": user['email'], "role": user.get('role', 'user')}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email exists, a code has been sent."}
    
    # MOCK: In a real app, send email. Here we just log it or return it for testing.
    # For prototype convenience, we'll return the code in the response (INSECURE but practical for testing)
    mock_code = "123456"
    
    # Store code in DB with expiration (simplified)
    await db.password_resets.update_one(
        {"email": request.email},
        {"$set": {"code": mock_code, "created_at": datetime.utcnow()}},
        upsert=True
    )
    
    return {"message": "Code sent", "debug_code": mock_code}

@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm, db: AsyncIOMotorDatabase = Depends(get_db)):
    if data.new_password != data.confirm_new_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    reset_entry = await db.password_resets.find_one({"email": data.email, "code": data.code})
    if not reset_entry:
        raise HTTPException(status_code=400, detail="Invalid code or email")
        
    # Update password
    hashed_password = get_password_hash(data.new_password)
    await db.users.update_one(
        {"email": data.email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    # Remove reset code
    await db.password_resets.delete_one({"email": data.email})
    
    return {"message": "Password updated successfully"}
