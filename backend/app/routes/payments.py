from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import PaymentResponse, PaymentInDB
from app.routes.auth import get_current_user, get_current_admin
from typing import List
import uuid
import shutil
from pathlib import Path
from datetime import datetime, timedelta, timezone

router = APIRouter()

async def get_db():
    from server import db
    return db

UPLOAD_DIR = Path("/app/backend/uploads/receipts")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- User Routes ---

@router.post("/upload", response_model=PaymentResponse)
async def upload_payment(
    plan_id: str = Form(...),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Validate plan
    plan = await db.plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate file type
    if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be an image or PDF")
    
    # Save file
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    receipt_url = f"/static/uploads/receipts/{filename}"
    
    # Create payment record
    payment = PaymentInDB(
        user_id=current_user['id'],
        plan_id=plan_id,
        receipt_url=receipt_url,
        status="pending"
    )
    
    payment_doc = payment.model_dump()
    payment_doc['created_at'] = payment_doc['created_at'].isoformat()
    
    await db.payments.insert_one(payment_doc)
    
    return payment

@router.get("/my-history", response_model=List[PaymentResponse])
async def get_my_payments(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    payments = await db.payments.find({"user_id": current_user['id']}).sort("created_at", -1).to_list(100)
    
    # Enrich with plan name
    for p in payments:
        plan = await db.plans.find_one({"id": p['plan_id']})
        if plan:
            p['plan_name'] = plan['name']
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
            
    return payments

# --- Admin Routes ---

@router.get("/pending", response_model=List[PaymentResponse])
async def get_pending_payments(
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    payments = await db.payments.find({"status": "pending"}).sort("created_at", -1).to_list(100)
    
    # Enrich data
    for p in payments:
        user = await db.users.find_one({"id": p['user_id']})
        plan = await db.plans.find_one({"id": p['plan_id']})
        
        if user:
            p['user_email'] = user['email']
        if plan:
            p['plan_name'] = plan['name']
            
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
            
    return payments

@router.post("/{payment_id}/approve")
async def approve_payment(
    payment_id: str,
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    if payment['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Payment already processed")
        
    # Get Plan
    plan = await db.plans.find_one({"id": payment['plan_id']})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan associated with payment not found")
        
    # Update Payment Status
    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": "approved"}}
    )
    
    # Activate User Plan
    expires_at = datetime.now(timezone.utc) + timedelta(days=plan['duration_days'])
    
    await db.users.update_one(
        {"id": payment['user_id']},
        {
            "$set": {
                "current_plan_id": plan['id'],
                "plan_expires_at": expires_at.isoformat()
            }
        }
    )
    
    return {"message": "Payment approved and plan activated"}

@router.post("/{payment_id}/reject")
async def reject_payment(
    payment_id: str,
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": "rejected"}}
    )
    
    return {"message": "Payment rejected"}
