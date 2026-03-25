import time
import json
import asyncio
import aiohttp
from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from typing import List, Dict, Any

from ..models.schema import ModelItem, DownloadTaskRequest, DownloadTaskResponse
from ..services.downloader import DownloadManager
from ..services.config import app_config
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/api", tags=["models"])


def _map_civitai_item(item: dict) -> dict:
    version = (item.get("modelVersions") or [{}])[0]
    file_info = (version.get("files") or [{}])[0]
    image_info = (version.get("images") or [{}])[0]
    return {
        "id": str(item.get("id")),
        "name": item.get("name") or "Unknown",
        "type": item.get("type") or "Unknown",
        "description": item.get("description") or "",
        "image_url": image_info.get("url") or "",
        "download_url": file_info.get("downloadUrl")
        or version.get("downloadUrl")
        or "",
        "version": version.get("name") or "v1.0",
    }


@router.get("/models", response_model=List[ModelItem])
async def get_models(
    query: str = Query("", alias="q"),
    limit: int = Query(20, ge=1, le=100),
    types: str = Query("Checkpoint,LORA"),
    current_user: dict = Depends(get_current_user),
):
    params: Dict[str, Any] = {"limit": limit}
    if query:
        params["query"] = query

    type_list = [item.strip() for item in types.split(",") if item.strip()]
    if type_list:
        if len(type_list) == 1:
            params["types"] = type_list[0]
        else:
            params["types"] = type_list

    try:
        headers = {}
        api_key = app_config.get("civitai_api_key")
        proxy = app_config.get("http_proxy")
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://civitai.com/api/v1/models",
                params=params,
                headers=headers,
                proxy=proxy,
                timeout=20,
            ) as response:
                response.raise_for_status()
                payload = await response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Civitai request failed: {exc}")

    items = payload.get("items") or []
    mapped_items = [
        _map_civitai_item(item)
        for item in items
        if _map_civitai_item(item)["download_url"]
    ]
    return mapped_items


@router.get("/local_models")
async def get_local_models(type: str = Query("all")):
    models_list = []

    # 将前端传递的不同大类名称，映射到实际扫描的目录名称
    if type == "all":
        types_to_scan = ["checkpoints", "loras", "vae", "controlnet"]
    elif type.lower() == "checkpoint":
        types_to_scan = ["checkpoints"]
    elif type.lower() == "lora":
        types_to_scan = ["loras"]
    elif type.lower() == "vae":
        types_to_scan = ["vae"]
    elif type.lower() == "controlnet":
        types_to_scan = ["controlnet"]
    else:
        # Fallback for unrecognized types (attempt to look up directory with exact lower case name)
        types_to_scan = [type.lower()]

    models_dir_base = app_config.get("models_dir", "C:/ComfyUI/models")

    for t in types_to_scan:
        models_dir = os.path.join(models_dir_base, t)
        if not os.path.exists(models_dir) or not os.path.isdir(models_dir):
            continue

        try:
            for file_name in os.listdir(models_dir):
                if file_name.endswith((".safetensors", ".ckpt", ".pt")):
                    file_path = os.path.join(models_dir, file_name)
                    if os.path.isfile(file_path):
                        size_mb = round(os.path.getsize(file_path) / (1024 * 1024), 2)
                        base_name = os.path.splitext(file_name)[0]

                        json_path = os.path.join(models_dir, f"{base_name}.json")
                        metadata = {}
                        if os.path.exists(json_path):
                            try:
                                with open(json_path, "r", encoding="utf-8") as jf:
                                    metadata = json.load(jf)
                            except Exception:
                                pass

                        models_list.append(
                            {
                                "name": file_name,
                                "base_name": base_name,
                                "size_mb": size_mb,
                                "type": t,
                                "status": "Ready",
                                "metadata": metadata,
                                "image_url": metadata.get("image_url") or "",
                                "description": metadata.get("description") or "无描述",
                            }
                        )
        except Exception:
            continue

    return {"status": "success", "data": models_list}


@router.delete("/local_models/{type}/{name}")
async def delete_local_model(
    type: str, name: str, current_user: dict = Depends(get_current_user)
):
    models_dir_base = app_config.get("models_dir", "C:/ComfyUI/models")
    models_dir = os.path.join(models_dir_base, type)
    base_name = os.path.splitext(name)[0]

    file_path = os.path.join(models_dir, name)
    json_path = os.path.join(models_dir, f"{base_name}.json")
    preview_path = os.path.join(models_dir, f"{base_name}.preview.png")

    deleted = False
    for path in [file_path, json_path, preview_path]:
        if os.path.exists(path):
            try:
                os.remove(path)
                deleted = True
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Failed to delete {path}: {str(e)}"
                )

    if not deleted:
        raise HTTPException(status_code=404, detail="Model not found")

    return {"status": "success", "message": "Model deleted successfully"}


@router.post("/download", response_model=DownloadTaskResponse)
async def start_download(
    req: DownloadTaskRequest, current_user: dict = Depends(get_current_user)
):
    task_id = await DownloadManager.create_task(req.model_id, req.url, req.metadata)
    task = DownloadManager.get_task(task_id)
    return DownloadTaskResponse(
        task_id=task_id,
        status=task["status"],
        model_id=req.model_id,
        progress=task["progress"],
        downloaded_bytes=task.get("downloaded_bytes", 0),
        total_bytes=task.get("total_bytes", 0),
        speed=task.get("speed", 0.0),
    )


@router.get("/admin/tasks", response_model=List[DownloadTaskResponse])
async def get_all_tasks(current_user: dict = Depends(get_current_user)):
    tasks = DownloadManager.list_tasks()
    return tasks


@router.websocket("/ws/tasks")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            tasks = DownloadManager.list_tasks()
            await websocket.send_json({"type": "progress", "data": tasks})
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass

from ..services.civitai_sync import sync_model_from_civitai
from ..services.log import logger

@router.post("/local_models/{type}/{name}/sync")
async def sync_local_model_civitai(
    type: str, name: str, current_user: dict = Depends(get_current_user)
):
    models_dir_base = app_config.get("models_dir", "C:/ComfyUI/models")
    models_dir = os.path.join(models_dir_base, type)
    file_path = os.path.join(models_dir, name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Model file not found")

    api_key = app_config.get("civitai_api_key")
    proxy = app_config.get("http_proxy")

    try:
        metadata = await sync_model_from_civitai(file_path, proxy, api_key)
        return {"status": "success", "message": "Metadata synced successfully", "data": metadata}
    except Exception as e:
        logger.error(f"Sync model failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse

@router.get("/local_models/{type}/{name}/preview")
async def get_local_model_preview(
    type: str, name: str
):
    models_dir_base = app_config.get("models_dir", "C:/ComfyUI/models")
    models_dir = os.path.join(models_dir_base, type)
    base_name = os.path.splitext(name)[0]
    preview_path = os.path.join(models_dir, f"{base_name}.preview.png")

    if os.path.exists(preview_path):
        return FileResponse(preview_path)
    raise HTTPException(status_code=404, detail="Preview not found")

