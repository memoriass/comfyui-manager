import time
import os
import jwt
from typing import Dict
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..services.user_manager import user_manager

JWT_SECRET = os.environ.get("JWT_SECRET", "comfyui-manager-secret-key-123")
JWT_ALGORITHM = "HS256"

security = HTTPBearer()


def create_token(user: Dict, expires_in: int = 86400 * 7) -> str:
    payload = {
        "uuid": user["uuid"],
        "userName": user["userName"],
        "permission": user["permission"],
        "exp": time.time() + expires_in,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = user_manager.get_user_by_uuid(payload.get("uuid"))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_admin_user(current_user: Dict = Depends(get_current_user)) -> Dict:
    from ..services.user_manager import ROLE

    if current_user.get("permission", 0) < ROLE.ADMIN:
        raise HTTPException(status_code=403, detail="Admin permission required")
    return current_user
