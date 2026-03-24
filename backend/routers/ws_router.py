import asyncio
import json
import logging
import aiohttp
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any

from backend.services.database import fetchall

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.task_cache: Dict[str, Any] = {}
        self.comfy_ws_connections: Dict[str, aiohttp.ClientWebSocketResponse] = {}
        self.current_prompt_ids: Dict[str, str] = {}
        self.is_monitoring = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send initial cached state
        if self.task_cache:
            await websocket.send_json(
                {"type": "draw_progress", "data": list(self.task_cache.values())}
            )

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

    async def start_monitoring(self):
        if self.is_monitoring:
            return
        self.is_monitoring = True
        asyncio.create_task(self._monitor_nodes())

    async def _monitor_nodes(self):
        while True:
            try:
                # 获取所有配置的远程节点
                rows = fetchall(
                    "SELECT id, url FROM nodes WHERE type='remote' OR type='local'"
                )
                active_urls = [r["url"] for r in rows if r["url"].startswith("http")]

                # 清理已删除节点的 websocket
                for url in list(self.comfy_ws_connections.keys()):
                    if url not in active_urls:
                        ws = self.comfy_ws_connections.pop(url)
                        await ws.close()

                # 为新节点建立连接
                for url in active_urls:
                    if (
                        url not in self.comfy_ws_connections
                        or self.comfy_ws_connections[url].closed
                    ):
                        asyncio.create_task(self._connect_to_comfy_node(url))

            except Exception as e:
                logging.error(f"Error in node monitor loop: {e}")

            await asyncio.sleep(10)

    async def _connect_to_comfy_node(self, node_url: str):
        ws_url = (
            node_url.replace("http://", "ws://").replace("https://", "wss://")
            + "/ws?clientId="
            + str(uuid.uuid4())
        )
        try:
            async with aiohttp.ClientSession() as session:
                async with session.ws_connect(ws_url) as ws:
                    self.comfy_ws_connections[node_url] = ws
                    logging.info(f"Connected to ComfyUI WS: {ws_url}")
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            data = json.loads(msg.data)
                            await self._handle_comfy_message(node_url, data)
                        elif msg.type in (
                            aiohttp.WSMsgType.CLOSED,
                            aiohttp.WSMsgType.ERROR,
                        ):
                            break
        except Exception as e:
            logging.error(f"Failed to connect to {ws_url}: {e}")
        finally:
            if node_url in self.comfy_ws_connections:
                del self.comfy_ws_connections[node_url]

    async def _handle_comfy_message(self, node_url: str, data: dict):
        # 处理 ComfyUI 返回的各种状态消息并缓存
        msg_type = data.get("type")
        msg_data = data.get("data", {})

        task_id = msg_data.get("prompt_id")

        if msg_type == "execution_start":
            self.current_prompt_ids[node_url] = task_id

        if not task_id:
            # 如果没有 prompt_id，可能是 progress 或 status
            task_id = self.current_prompt_ids.get(node_url, "unknown")

        if msg_type in [
            "execution_start",
            "status",
            "progress",
            "executing",
            "execution_success",
            "execution_error",
            "execution_cached",
        ]:
            if task_id not in self.task_cache:
                self.task_cache[task_id] = {
                    "task_id": task_id,
                    "url": node_url,
                    "status": "pending",
                    "progress": 0,
                }

            if msg_type in ["execution_start", "executing", "progress"]:
                if self.task_cache[task_id]["status"] == "pending":
                    self.task_cache[task_id]["status"] = "running"

            if msg_type == "progress":
                val = msg_data.get("value", 0)
                max_val = max(msg_data.get("max", 1), 1)
                self.task_cache[task_id]["progress"] = int((val / max_val) * 100)
            elif msg_type == "execution_success" or msg_type == "execution_cached":
                self.task_cache[task_id]["status"] = "completed"
                self.task_cache[task_id]["progress"] = 100
            elif msg_type == "execution_error":
                self.task_cache[task_id]["status"] = "failed"

            # 提取所有任务作为数组发送
            tasks_list = list(self.task_cache.values())
            await self.broadcast(
                json.dumps({"type": "draw_progress", "data": tasks_list})
            )


manager = ConnectionManager()


@router.on_event("startup")
async def startup_event():
    await manager.start_monitoring()


@router.websocket("/ws/draws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 可以在这里接收前端的心跳或者控制指令
    except WebSocketDisconnect:
        manager.disconnect(websocket)
