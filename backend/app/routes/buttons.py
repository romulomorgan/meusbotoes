from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import ButtonCreate, ButtonResponse, ButtonInDB, ButtonUpdate
from app.routes.auth import get_current_user
from app.utils.scraper import get_url_metadata
from typing import List
import os
import shutil
import uuid
from pathlib import Path
from datetime import datetime, timezone

router = APIRouter()

async def get_db():
    from server import db
    return db

UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", response_model=ButtonResponse)
async def create_button(
    button_in: ButtonCreate, 
    current_user = Depends(get_current_user), 
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # --- Plan Limit Check ---
    # 1. Get current plan
    plan_id = current_user.get('current_plan_id')
    limit = 0 # Default to 0
    
    print(f"DEBUG: Creating button for user {current_user.get('email')}")
    print(f"DEBUG: Current Plan ID: {plan_id}")

    if plan_id:
        plan = await db.plans.find_one({"id": plan_id})
        if plan:
            limit = plan['button_limit']
            print(f"DEBUG: Plan found: {plan.get('name')}, Limit: {limit}")
            
            # Check expiration
            expires_at_str = current_user.get('plan_expires_at')
            if expires_at_str:
                try:
                    expires_at = datetime.fromisoformat(expires_at_str)
                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)
                    
                    if datetime.now(timezone.utc) > expires_at:
                        print("DEBUG: Plan expired")
                        raise HTTPException(status_code=403, detail="Seu plano expirou. Por favor, renove sua assinatura.")
                except ValueError:
                    print("DEBUG: Invalid expiration date format")
                    pass
        else:
            print("DEBUG: Plan ID found in user but plan not found in DB")
    else:
        # Fallback to free plan
        print("DEBUG: No plan assigned, looking for free plan")
        free_plan = await db.plans.find_one({"price": 0.0})
        if free_plan:
            limit = free_plan['button_limit']
            print(f"DEBUG: Free plan found, Limit: {limit}")
        else:
            limit = 0
            print("DEBUG: No free plan found, Limit: 0")

    # 2. Count existing buttons
    # count = await db.buttons.count_documents({"user_id": current_user['id']})
    # Explicitly fetch to debug
    existing_buttons = await db.buttons.find({"user_id": current_user['id']}).to_list(1000)
    count = len(existing_buttons)
    
    print(f"DEBUG: User ID: {current_user['id']}")
    print(f"DEBUG: Current button count: {count}")
    print(f"DEBUG: Existing titles: {[b.get('title') for b in existing_buttons]}")
    
    # 3. Verify limit (if not unlimited i.e. -1)
    if limit != -1 and count >= limit:
        print(f"DEBUG: Limit reached! {count} >= {limit}")
        raise HTTPException(
            status_code=403, 
            detail=f"Seu plano não permite criar mais botões. Limite atual: {limit}"
        )

    # --- Proceed with Creation ---
    
    # Scrape metadata
    metadata = get_url_metadata(button_in.original_url)
    
    # Use provided title if available, else scraped title
    final_title = button_in.title if button_in.title else metadata["title"]
    
    new_button = ButtonInDB(
        user_id=current_user['id'],
        original_url=metadata["original_url"],
        title=final_title,
        icon_url=metadata["icon_url"],
        category=button_in.category
    )
    
    button_doc = new_button.model_dump()
    button_doc['created_at'] = button_doc['created_at'].isoformat()
    
    await db.buttons.insert_one(button_doc)
    
    return new_button

@router.get("/", response_model=List[ButtonResponse])
async def get_my_buttons(
    current_user = Depends(get_current_user), 
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    buttons = await db.buttons.find({"user_id": current_user['id']}).to_list(1000)
    
    # Fix datetime
    for btn in buttons:
        if isinstance(btn.get('created_at'), str):
            from datetime import datetime
            btn['created_at'] = datetime.fromisoformat(btn['created_at'])
            
    return buttons

@router.put("/{button_id}", response_model=ButtonResponse)
async def update_button(
    button_id: str,
    button_update: ButtonUpdate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify ownership
    button = await db.buttons.find_one({"id": button_id, "user_id": current_user['id']})
    if not button:
        raise HTTPException(status_code=404, detail="Button not found")
    
    update_data = {k: v for k, v in button_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.buttons.update_one(
            {"id": button_id},
            {"$set": update_data}
        )
        
    updated_button = await db.buttons.find_one({"id": button_id})
    
    # Fix datetime
    if isinstance(updated_button.get('created_at'), str):
        from datetime import datetime
        updated_button['created_at'] = datetime.fromisoformat(updated_button['created_at'])
        
    return updated_button

@router.delete("/{button_id}")
async def delete_button(
    button_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    result = await db.buttons.delete_one({"id": button_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Button not found")
    return {"message": "Button deleted"}

@router.post("/upload-icon")
async def upload_icon(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"icon_url": f"/static/uploads/{filename}"}
