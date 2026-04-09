from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.database import get_db

SECRET_KEY = "hiss-hospital-secret-key-2024-secure"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def authenticate_user(username: str, password: str) -> Optional[dict]:
    db = get_db()

    if db is not None:
        user = await db.users.find_one({"username": username, "active": True})
        if user and verify_password(password, user["password"]):
            user["_id"] = str(user["_id"])
            return user
    else:
        in_memory_users = {
            "doctor": {
                "_id": "1",
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
            "wardman": {
                "_id": "2",
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
        }
        user = in_memory_users.get(username)
        if user and verify_password(password, user["password"]):
            return user

    return None


async def get_user_by_username(username: str) -> Optional[dict]:
    db = get_db()
    if db is not None:
        user = await db.users.find_one({"username": username})
        if user:
            user["_id"] = str(user["_id"])
        return user
    return None
