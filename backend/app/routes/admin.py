from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.routes.auth import get_current_admin
from app.models import UserResponse
from typing import List
from datetime import datetime, timedelta, timezone

router = APIRouter()

async def get_db():
    from server import db
    return db

@router.get("/renewals", response_model=List[UserResponse])
async def get_expiring_users(
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Find users expiring in the next 7 days
    now = datetime.now(timezone.utc)
    seven_days_from_now = now + timedelta(days=7)
    
    # Query: plan_expires_at > now AND plan_expires_at <= seven_days_from_now
    # Note: We store dates as ISO strings in MongoDB in this prototype, which makes range queries tricky 
    # if not careful. Ideally, we should store as ISODate objects.
    # However, ISO 8601 strings sort correctly lexicographically.
    
    users = await db.users.find({
        "plan_expires_at": {
            "$gt": now.isoformat(),
            "$lte": seven_days_from_now.isoformat()
        }
    }).to_list(100)
    
    # Fix datetime for response
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('plan_expires_at'), str):
            user['plan_expires_at'] = datetime.fromisoformat(user['plan_expires_at'])
        if isinstance(user.get('renewal_notice_sent_at'), str):
            user['renewal_notice_sent_at'] = datetime.fromisoformat(user['renewal_notice_sent_at'])
            
    return users

@router.post("/renewals/{user_id}/mark-sent")
async def mark_renewal_sent(
    user_id: str,
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"renewal_notice_sent_at": now.isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "Marked as sent", "timestamp": now}
