from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from ..services.config import app_config
from ..middleware.auth import get_admin_user
from ..services.user_manager import user_manager

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    models_dir: Optional[str] = None
    civitai_api_key: Optional[str] = None
    http_proxy: Optional[str] = None
    admin_username: Optional[str] = None
    admin_password: Optional[str] = None
    active_node_id: Optional[str] = None


@router.get("")
async def get_settings(current_user: dict = Depends(get_admin_user)):
    return {
        "models_dir": app_config.get("models_dir"),
        "civitai_api_key": app_config.get("civitai_api_key"),
        "http_proxy": app_config.get("http_proxy"),
        "active_node_id": app_config.get("active_node_id"),
        "admin_username": current_user["userName"],
    }


@router.post("")
async def update_settings(
    req: SettingsUpdate, current_user: dict = Depends(get_admin_user)
):
    if req.models_dir is not None:
        app_config.set("models_dir", req.models_dir)
    if req.civitai_api_key is not None:
        app_config.set("civitai_api_key", req.civitai_api_key)
    if req.http_proxy is not None:
        app_config.set("http_proxy", req.http_proxy)
    if req.active_node_id is not None:
        app_config.set("active_node_id", req.active_node_id)

    if req.admin_username and req.admin_password:
        user_manager.update_password(req.admin_username, req.admin_password)

    return {"status": "ok"}
