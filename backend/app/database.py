import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import asyncio

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hiss_hospital")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")
        db = client[DB_NAME]
        print(f"✅ MongoDB connected: {MONGO_URL}/{DB_NAME}")
        await create_indexes()
        await seed_users()
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        print("   Running without persistent database (in-memory mode)")
        db = None


async def disconnect_db():
    global client
    if client:
        client.close()
        print("MongoDB disconnected")


async def create_indexes():
    if db is None:
        return
    try:
        await db.users.create_index([("username", ASCENDING)], unique=True)
        await db.wards.create_index([("ward_id", ASCENDING)], unique=True)
        await db.alerts.create_index([("timestamp", ASCENDING)])
        await db.patient_records.create_index([("patient_id", ASCENDING)])
        await db.patient_records.create_index([("ward_id", ASCENDING)])
        await db.patient_records.create_index([("risk_score", ASCENDING)])
        print("Database indexes created")
    except Exception as e:
        print(f"Index creation error: {e}")


async def seed_users():
    if db is None:
        return
    from app.services.auth_service import hash_password

    users = [
        {
            "username": "doctor",
            "password": hash_password("Doctor@2024"),
            "full_name": "Dr. Ravi Sharma",
            "role": "doctor",
            "department": "Infectious Diseases",
            "employee_id": "DOC-001",
            "email": "dr.sharma@hospital.com",
            "phone": "+91-9876543210",
            "active": True,
        },
        {
            "username": "wardman",
            "password": hash_password("Ward@2024"),
            "full_name": "Suresh Kumar",
            "role": "wardman",
            "department": "Ward Operations",
            "employee_id": "WRD-001",
            "email": "suresh.kumar@hospital.com",
            "phone": "+91-9876543211",
            "active": True,
        },
    ]

    for user in users:
        existing = await db.users.find_one({"username": user["username"]})
        if not existing:
            await db.users.insert_one(user)
            print(f"✅ Seeded user: {user['username']} ({user['role']})")
        else:
            print(f"   User already exists: {user['username']}")


def get_db():
    return db
