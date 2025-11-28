from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import PlanCreate, PlanResponse, PlanInDB, PlanUpdate, UserResponse
from app.routes.auth import get_current_user, get_current_admin
from typing import List
from datetime import datetime, timedelta, timezone
import uuid

router = APIRouter()

async def get_db():
    from server import db
    return db

# --- Public/User Routes ---

@router.get("/", response_model=List[PlanResponse])
async def get_plans(db: AsyncIOMotorDatabase = Depends(get_db)):
    plans = await db.plans.find({}).to_list(100)
    return plans

@router.post("/subscribe/{plan_id}", response_model=UserResponse)
async def subscribe_to_plan(
    plan_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Fetch plan
    plan = await db.plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Calculate expiration
    expires_at = datetime.now(timezone.utc) + timedelta(days=plan['duration_days'])
    
    # Update user
    await db.users.update_one(
        {"id": current_user['id']},
        {
            "$set": {
                "current_plan_id": plan_id,
                "plan_expires_at": expires_at.isoformat()
            }
        }
    )
    
    # Return updated user
    updated_user = await db.users.find_one({"id": current_user['id']})
    
    # Fix datetime for response
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    if isinstance(updated_user.get('plan_expires_at'), str):
        updated_user['plan_expires_at'] = datetime.fromisoformat(updated_user['plan_expires_at'])
        
    return updated_user

@router.get("/my-plan")
async def get_my_plan_details(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    plan_id = current_user.get('current_plan_id')
    
    plan = None
    if plan_id:
        plan = await db.plans.find_one({"id": plan_id})
        if plan:
            del plan['_id']
            
    # Get usage
    button_count = await db.buttons.count_documents({"user_id": current_user['id']})
    
    return {
        "plan": plan,
        "usage": button_count,
        "expires_at": current_user.get('plan_expires_at')
    }

# --- Admin Routes ---

@router.post("/", response_model=PlanResponse)
async def create_plan(
    plan_in: PlanCreate,
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    new_plan = PlanInDB(**plan_in.model_dump())
    await db.plans.insert_one(new_plan.model_dump())
    return new_plan

@router.put("/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: str,
    plan_update: PlanUpdate,
    admin = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    update_data = {k: v for k, v in plan_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.plans.update_one(
            {"id": plan_id},
            {"$set": update_data}
        )
        
    updated_plan = await db.plans.find_one({"id": plan_id})
    if not updated_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    return updated_plan

# --- Seeding ---
async def seed_plans(db):
    # 1. Update/Migrate "Plano 3 Botões" to "Plano 7 Botões"
    # We look for the old plan by name or properties
    await db.plans.update_one(
        {"name": "Plano 3 Botões"},
        {
            "$set": {
                "name": "Plano 7 Botões",
                "button_limit": 7,
                "description": "Ideal para começar (Gratuito)"
            }
        }
    )
    
    # 2. Update "Plano Ilimitado" price to 9.90
    await db.plans.update_one(
        {"name": "Plano Ilimitado"},
        {
            "$set": {
                "price": 9.90,
                "description": "Sem restrições (Oferta Especial)"
            }
        }
    )

    # 3. Ensure plans exist if DB was empty
    # Check if "Plano 7 Botões" exists
    if not await db.plans.find_one({"name": "Plano 7 Botões"}):
        await db.plans.insert_one({
            "name": "Plano 7 Botões",
            "description": "Ideal para começar (Gratuito)",
            "price": 0.0,
            "button_limit": 7,
            "duration_days": 30,
            "id": str(uuid.uuid4())
        })
        
    # Check if "Plano Ilimitado" exists
    if not await db.plans.find_one({"name": "Plano Ilimitado"}):
        await db.plans.insert_one({
            "name": "Plano Ilimitado",
            "description": "Sem restrições (Oferta Especial)",
            "price": 9.90,
            "button_limit": -1,
            "duration_days": 30,
            "id": str(uuid.uuid4())
        })

    # 4. Cleanup deprecated plans (20 buttons, etc)
    await db.plans.delete_many({"button_limit": {"$in": [3, 20]}}) # 3 is deleted if it wasn't renamed (e.g. duplicate)
    
    print("Plans updated successfully.")
