#!/usr/bin/env python3
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient

# Add the backend path to sys.path
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def fix_admin_user():
    try:
        # Find admin user
        admin_user = await db.users.find_one({"email": "admin@example.com"})
        if not admin_user:
            print("Admin user not found!")
            return
        
        # Update password field to hashed_password
        if 'password' in admin_user and 'hashed_password' not in admin_user:
            result = await db.users.update_one(
                {"email": "admin@example.com"},
                {
                    "$set": {"hashed_password": admin_user['password']},
                    "$unset": {"password": ""}
                }
            )
            print("Fixed admin user password field")
        
        # Also fix the test user
        test_user = await db.users.find_one({"email": "renewal.test@example.com"})
        if test_user and 'password' in test_user and 'hashed_password' not in test_user:
            result = await db.users.update_one(
                {"email": "renewal.test@example.com"},
                {
                    "$set": {"hashed_password": test_user['password']},
                    "$unset": {"password": ""}
                }
            )
            print("Fixed test user password field")
        
        print("Password fields fixed successfully!")
        
    except Exception as e:
        print(f"Error fixing admin user: {e}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_admin_user())