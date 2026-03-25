import asyncio
import uuid
import logging
import os
import aiohttp
import time
from typing import Dict, Any
from .config import app_config

logger = logging.getLogger(__name__)

# 真实的任务存储
_tasks: Dict[str, Any] = {}

class DownloadManager:
    # 限制同时下载的任务数，其余任务会在 _queued_download 中 await 等待锁，保持 pending 状态
    _semaphore = asyncio.Semaphore(2)  # 默认值，将在 startup 时由配置更新

    @staticmethod
    def set_concurrency(limit: int):
        """动态修改并发限制"""
        if limit < 1:
            limit = 1
        # Python 的 Semaphore 不支持直接修改 value，通常需要重新实例化
        # 为了避免影响正在等待的任务，这里简单粗暴地替换
        # 注意：这可能会导致短暂的并发控制失效，但在本场景下可以接受
        DownloadManager._semaphore = asyncio.Semaphore(limit)
        app_config.set("max_concurrent_downloads", limit)

    @staticmethod
    async def create_task(
        model_id: str, url: str, metadata: Dict[str, Any] = None
    ) -> str:
        task_id = str(uuid.uuid4())
        _tasks[task_id] = {
            "task_id": task_id,
            "model_id": model_id,
            "status": "pending",
            "progress": 0.0,
            "downloaded_bytes": 0,
            "total_bytes": 0,
            "speed": 0.0,
            "url": url,
            "metadata": metadata or {},
        }
        # 后台启动异步下载，并用 Semaphore 限制并发
        asyncio.create_task(DownloadManager._queued_download(task_id))
        return task_id

    @staticmethod
    async def _queued_download(task_id: str):
        async with DownloadManager._semaphore:
            await DownloadManager._download_file(task_id)

    @staticmethod
    def get_task(task_id: str) -> dict:
        return _tasks.get(task_id, {})

    @staticmethod
    def list_tasks() -> list:
        return list(_tasks.values())

    @staticmethod
    async def _download_file(task_id: str):
        task = _tasks[task_id]
        task["status"] = "downloading"
        url = task["url"]
        metadata = task.get("metadata", {})

        # 目标存放目录
        target_dir = os.path.join(
            app_config.get("models_dir", "C:/ComfyUI/models"), "checkpoints"
        )
        os.makedirs(target_dir, exist_ok=True)
        base_name = (
            f"{task['model_id']}_{metadata.get('name', 'model').replace('/', '_')}"
        )
        file_path = os.path.join(target_dir, f"{base_name}.safetensors")
        json_path = os.path.join(target_dir, f"{base_name}.json")
        preview_path = os.path.join(target_dir, f"{base_name}.preview.png")

        try:
            # 1. 保存元数据 JSON
            import json

            with open(json_path, "w", encoding="utf-8") as jf:
                json.dump(metadata, jf, ensure_ascii=False, indent=2)

            headers = {}
            api_key = app_config.get("civitai_api_key")
            proxy = app_config.get("http_proxy")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            async with aiohttp.ClientSession(headers=headers) as session:
                # 2. 尝试下载预览图
                if metadata.get("image_url"):
                    try:
                        async with session.get(
                            metadata["image_url"], proxy=proxy
                        ) as img_res:
                            if img_res.status == 200:
                                with open(preview_path, "wb") as pf:
                                    pf.write(await img_res.read())
                    except Exception as e:
                        logger.warning(f"Failed to download preview image: {e}")

                # 3. 下载主文件
                async with session.get(url, proxy=proxy) as response:
                    response.raise_for_status()
                    total_size = int(response.headers.get("Content-Length", 0))

                    downloaded_size = 0
                    chunk_size = 1024 * 1024  # 1MB chunks

                    start_time = time.time()
                    last_time = start_time
                    last_downloaded = 0

                    with open(file_path, "wb") as f:
                        async for chunk in response.content.iter_chunked(chunk_size):
                            if not chunk:
                                break
                            f.write(chunk)
                            downloaded_size += len(chunk)

                            task["downloaded_bytes"] = downloaded_size
                            task["total_bytes"] = total_size

                            current_time = time.time()
                            if current_time - last_time >= 0.5:
                                task["speed"] = (downloaded_size - last_downloaded) / (current_time - last_time)
                                last_time = current_time
                                last_downloaded = downloaded_size

                            if total_size > 0:
                                task["progress"] = round(
                                    (downloaded_size / total_size) * 100, 2
                                )
                            else:
                                task["progress"] = min(99.9, task["progress"] + 1.0)

            task["status"] = "completed"
            task["progress"] = 100.0
            task["speed"] = 0.0

        except Exception as e:
            logger.error(f"Download failed for task {task_id}: {e}")
            task["status"] = f"failed: {str(e)}"
            task["speed"] = 0.0
