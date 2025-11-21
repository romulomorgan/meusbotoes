#!/usr/bin/env python3
import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import uuid

# Add the backend path to sys.path
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    try:
        # Check if admin user already exists
        existing_admin = await db.users.find_one({"email": "admin@example.com"})
        if existing_admin:
            print("Admin user already exists!")
            return existing_admin
        
        # Create admin user
        hashed_password = pwd_context.hash("admin123")
        admin_user = {
            "id": str(uuid.uuid4()),
            "full_name": "Admin User",
            "email": "admin@example.com",
            "phone": "5511999999999",
            "password": hashed_password,
            "role": "admin",  # Set role as admin
            "created_at": datetime.now(timezone.utc).isoformat(),
            "current_plan_id": None,
            "plan_expires_at": None,
            "renewal_notice_sent_at": None
        }
        
        result = await db.users.insert_one(admin_user)
        print(f"Admin user created successfully with ID: {admin_user['id']}")
        return admin_user
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return None

async def create_test_user_with_expiring_plan():
    try:
        # Check if test user already exists
        existing_user = await db.users.find_one({"email": "renewal.test@example.com"})
        if existing_user:
            print("Test user already exists!")
            # Update their plan to expire tomorrow
            tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
            await db.users.update_one(
                {"email": "renewal.test@example.com"},
                {"$set": {"plan_expires_at": tomorrow.isoformat()}}
            )
            print("Updated test user's plan to expire tomorrow")
            return existing_user
        
        # Create test user with plan expiring tomorrow
        hashed_password = pwd_context.hash("password123")
        tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
        
        # Get a plan ID (let's use the first plan)
        plan = await db.plans.find_one({})
        plan_id = plan['id'] if plan else None
        
        test_user = {
            "id": str(uuid.uuid4()),
            "full_name": "Test User Renewal",
            "email": "renewal.test@example.com",
            "phone": "5511888887777",
            "password": hashed_password,
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "current_plan_id": plan_id,
            "plan_expires_at": tomorrow.isoformat(),
            "renewal_notice_sent_at": None
        }
        
        result = await db.users.insert_one(test_user)
        print(f"Test user created successfully with ID: {test_user['id']}")
        print(f"Plan expires at: {tomorrow.isoformat()}")
        return test_user
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        return None

async def main():
    print("Creating admin user...")
    admin = await create_admin_user()
    
    print("\nCreating test user with expiring plan...")
    test_user = await create_test_user_with_expiring_plan()
    
    # List all users
    print("\nAll users in database:")
    users = await db.users.find({}, {"password": 0}).to_list(10)
    for user in users:
        print(f"- {user['full_name']} ({user['email']}) - Role: {user.get('role', 'user')} - Plan expires: {user.get('plan_expires_at', 'N/A')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())