from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import CategoryCreate, CategoryResponse, CategoryInDB
from app.routes.auth import get_current_user
from typing import List
import uuid

router = APIRouter()

async def get_db():
    from server import db
    return db

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_in: CategoryCreate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    new_category = CategoryInDB(
        user_id=current_user['id'],
        **category_in.model_dump()
    )
    
    cat_doc = new_category.model_dump()
    cat_doc['created_at'] = cat_doc['created_at'].isoformat()
    
    await db.categories.insert_one(cat_doc)
    return new_category

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    categories = await db.categories.find({"user_id": current_user['id']}).to_list(100)
    
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            from datetime import datetime
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
            
    return categories

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Remove category from buttons first
    await db.buttons.update_many(
        {"category_id": category_id, "user_id": current_user['id']},
        {"$set": {"category_id": None}}
    )
    
    result = await db.categories.delete_one({"id": category_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
        
    return {"message": "Category deleted"}
