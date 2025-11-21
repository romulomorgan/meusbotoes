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
    plan_id = current_user.get('current_plan_id')
    limit = 0 
    
    if plan_id:
        plan = await db.plans.find_one({"id": plan_id})
        if plan:
            limit = plan['button_limit']
            
            # Check expiration
            expires_at_str = current_user.get('plan_expires_at')
            if expires_at_str:
                try:
                    expires_at = datetime.fromisoformat(expires_at_str)
                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)
                    
                    if datetime.now(timezone.utc) > expires_at:
                        raise HTTPException(status_code=403, detail="Seu plano expirou. Por favor, renove sua assinatura.")
                except ValueError:
                    pass
    else:
        free_plan = await db.plans.find_one({"price": 0.0})
        if free_plan:
            limit = free_plan['button_limit']
        else:
            limit = 0

    # Count existing buttons
    existing_buttons = await db.buttons.find({"user_id": current_user['id']}).to_list(1000)
    count = len(existing_buttons)
    
    if limit != -1 and count >= limit:
        raise HTTPException(
            status_code=403, 
            detail=f"Seu plano não permite criar mais botões. Limite atual: {limit}"
        )

    # --- Proceed with Creation ---
    metadata = get_url_metadata(button_in.original_url)
    final_title = button_in.title if button_in.title else metadata["title"]
    
    new_button = ButtonInDB(
        user_id=current_user['id'],
        original_url=metadata["original_url"],
        title=final_title,
        icon_url=metadata["icon_url"],
        category_id=button_in.category_id
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
    button = await db.buttons.find_one({"id": button_id, "user_id": current_user['id']})
    if not button:
        raise HTTPException(status_code=404, detail="Button not found")
    
    # Check favorite limit if trying to favorite
    if button_update.is_favorite:
        fav_count = await db.buttons.count_documents({"user_id": current_user['id'], "is_favorite": True})
        if fav_count >= 5 and not button.get('is_favorite'):
            raise HTTPException(status_code=400, detail="Limite de 5 favoritos atingido.")

    update_data = {k: v for k, v in button_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.buttons.update_one(
            {"id": button_id},
            {"$set": update_data}
        )
        
    updated_button = await db.buttons.find_one({"id": button_id})
    
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
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"icon_url": f"/static/uploads/{filename}"}

@router.post("/{button_id}/click")
async def track_click(
    button_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Public endpoint for tracking clicks (can be secured if needed)
    await db.buttons.update_one(
        {"id": button_id},
        {"$inc": {"click_count": 1}}
    )
    return {"message": "Click tracked"}

@router.get("/public/{button_id}", response_model=ButtonResponse)
async def get_public_button(
    button_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    button = await db.buttons.find_one({"id": button_id})
    if not button:
        raise HTTPException(status_code=404, detail="Button not found")
        
    if isinstance(button.get('created_at'), str):
        from datetime import datetime
        button['created_at'] = datetime.fromisoformat(button['created_at'])
        
    return button
