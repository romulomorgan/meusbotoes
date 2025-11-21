from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import UserResponse
from app.security import ALGORITHM, SECRET_KEY
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from typing import List

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_db():
    from server import db
    return db

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Convert datetime for Pydantic
    if isinstance(user.get('created_at'), str):
        from datetime import datetime
        user['created_at'] = datetime.fromisoformat(user['created_at'])
        
    return user

async def get_current_admin(current_user = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserResponse])
async def read_users(skip: int = 0, limit: int = 100, db: AsyncIOMotorDatabase = Depends(get_db), admin = Depends(get_current_admin)):
    users = await db.users.find({}, {"hashed_password": 0}).skip(skip).limit(limit).to_list(length=limit)
    
    # Fix datetime
    for user in users:
        if isinstance(user.get('created_at'), str):
            from datetime import datetime
            user['created_at'] = datetime.fromisoformat(user['created_at'])
            
    return users
