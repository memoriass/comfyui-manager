import uuid
import aiohttp
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any
import backend.services.database as db
from ..middleware.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/api", tags=["nodes"])


class NodeItem(BaseModel):
    id: str
    name: str
    url: str
    type: str
    auth_type: str = "none"
    auth_credentials: str = ""


class NodeCreate(BaseModel):
    name: str
    url: str
    auth_type: str = "none"
    auth_credentials: str = ""


@router.get("/nodes", response_model=List[NodeItem])
async def get_nodes(current_user: dict = Depends(get_current_user)):
    # Safely select columns, allowing missing auth columns if DB not migrated yet
    rows = db.fetchall("PRAGMA table_info(nodes)")
    cols = [r["name"] for r in rows]
    if "auth_type" not in cols:
        db.execute("ALTER TABLE nodes ADD COLUMN auth_type TEXT DEFAULT 'none'")
        db.execute("ALTER TABLE nodes ADD COLUMN auth_credentials TEXT")

    rows = db.fetchall("SELECT id, name, url, type, auth_type, auth_credentials FROM nodes ORDER BY created_at ASC")
    nodes = [
        {"id": r["id"], "name": r["name"], "url": r["url"], "type": r["type"], "auth_type": r["auth_type"] or "none", "auth_credentials": r["auth_credentials"] or ""}
        for r in rows
    ]

    # If no nodes, return empty array. The frontend can handle it.
    return nodes


@router.post("/nodes", response_model=NodeItem)
async def add_node(req: NodeCreate, current_user: dict = Depends(get_admin_user)):
    node_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO nodes (id, name, url, type, auth_type, auth_credentials) VALUES (?, ?, ?, 'remote', ?, ?)",
        (node_id, req.name, req.url, req.auth_type, req.auth_credentials),
    )
    return {"id": node_id, "name": req.name, "url": req.url, "type": "remote", "auth_type": req.auth_type, "auth_credentials": req.auth_credentials}


@router.put("/nodes/{node_id}", response_model=NodeItem)
async def update_node(
    node_id: str, req: NodeCreate, current_user: dict = Depends(get_admin_user)
):
    db.execute(
        "UPDATE nodes SET name = ?, url = ?, auth_type = ?, auth_credentials = ? WHERE id = ?", (req.name, req.url, req.auth_type, req.auth_credentials, node_id)
    )
    return {"id": node_id, "name": req.name, "url": req.url, "type": "remote", "auth_type": req.auth_type, "auth_credentials": req.auth_credentials}


@router.delete("/nodes/{node_id}")
async def delete_node(node_id: str, current_user: dict = Depends(get_admin_user)):
    db.execute("DELETE FROM nodes WHERE id = ?", (node_id,))
    return {"status": "ok"}


@router.post("/generate")
async def generate_workflow(
    workflow: Dict[str, Any],
    node_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    row = db.fetchone("SELECT url FROM nodes WHERE id = ?", (node_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Node not found")

    comfy_url = row["url"].rstrip("/")
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{comfy_url}/prompt", json={"prompt": workflow}
            ) as resp:
                data = await resp.json()
                if resp.status == 200:
                    return {"status": "success", "prompt_id": data.get("prompt_id")}
                return {"status": "error", "message": data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/generate/status/{prompt_id}")
async def get_generate_status(
    prompt_id: str,
    node_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    row = db.fetchone("SELECT url FROM nodes WHERE id = ?", (node_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Node not found")

    comfy_url = row["url"].rstrip("/")
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{comfy_url}/history/{prompt_id}") as resp:
                data = await resp.json()
                if prompt_id in data:
                    return {"status": "completed", "data": data[prompt_id]}
                return {"status": "running or pending"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
