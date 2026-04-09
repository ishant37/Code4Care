from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.services.auth_service import authenticate_user, create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login")
async def login(request: LoginRequest):
    user = await authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token_data = {
        "sub": user["username"],
        "role": user["role"],
        "name": user["full_name"],
        "employee_id": user["employee_id"],
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "department": user["department"],
            "employee_id": user["employee_id"],
            "email": user["email"],
        },
    }


@router.get("/me")
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {
        "username": payload.get("sub"),
        "role": payload.get("role"),
        "name": payload.get("name"),
        "employee_id": payload.get("employee_id"),
    }


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
