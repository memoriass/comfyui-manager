from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import socket

from ..services.config import app_config
from ..services.user_manager import user_manager, ROLE
from ..middleware.auth import create_token, get_current_user

router = APIRouter(prefix="/api", tags=["auth", "setup"])


class LoginRequest(BaseModel):
    username: str
    password: str


class SetupRequest(BaseModel):
    admin_username: str
    admin_password: str
    host: str = "0.0.0.0"
    port: int = 8000


@router.post("/login")
async def login(req: LoginRequest):
    user = user_manager.check_login(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(user), "user": user}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/setup/status")
async def setup_status():
    initialized = app_config.get("initialized", False)
    if not initialized:
        import backend.services.database as db

        row = db.fetchone("SELECT 1 FROM users LIMIT 1")
        if row:
            app_config.set("initialized", True)
            initialized = True

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        local_ip = "127.0.0.1"

    return {
        "status": "ok",
        "initialized": initialized,
        "local_ip": local_ip,
        "default_port": app_config.get("port", 8000),
    }


@router.post("/setup/init")
async def setup_init(req: SetupRequest):
    if app_config.get("initialized", False):
        raise HTTPException(status_code=400, detail="System already initialized")

    if not req.admin_username or len(req.admin_password) < 6:
        raise HTTPException(
            status_code=400, detail="Invalid username or password (min 6 chars)"
        )

    user = user_manager.create_user(
        req.admin_username, req.admin_password, permission=ROLE.ADMIN
    )
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create admin user")

    app_config.update(
        {
            "initialized": True,
            "host": req.host,
            "port": req.port,
        }
    )

    return {
        "status": "ok",
        "message": "System initialized successfully",
        "user": user,
        "token": create_token(user),
    }
