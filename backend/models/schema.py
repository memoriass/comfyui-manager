from pydantic import BaseModel
from typing import Optional, Dict, Any


class ModelItem(BaseModel):
    id: str
    name: str
    type: str  # checkpoint, lora, vae, etc.
    description: Optional[str] = None
    image_url: Optional[str] = None
    download_url: str
    version: str


class DownloadTaskRequest(BaseModel):
    model_id: str
    url: str
    metadata: Optional[Dict[str, Any]] = None


class DownloadTaskResponse(BaseModel):
    task_id: str
    status: str
    model_id: str
    progress: float
    downloaded_bytes: Optional[int] = 0
    total_bytes: Optional[int] = 0
    speed: Optional[float] = 0.0
