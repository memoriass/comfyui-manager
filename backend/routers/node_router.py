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

@router.get("/draw_logs")
async def get_draw_logs(
    task_id: str = Query(""),
    node_id: str = Query(""),
    started_from: str = Query(""),
    started_to: str = Query(""),
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
):
    where_clauses = []
    params: List[Any] = []

    if task_id:
        where_clauses.append("d.task_id LIKE ?")
        params.append(f"%{task_id}%")
    if node_id:
        where_clauses.append("d.node_id LIKE ?")
        params.append(f"%{node_id}%")
    if started_from:
        where_clauses.append("date(d.started_at) >= date(?)")
        params.append(started_from)
    if started_to:
        where_clauses.append("date(d.started_at) <= date(?)")
        params.append(started_to)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    params.append(limit)

    rows = db.fetchall(
        f"""
        SELECT
            d.id,
            d.task_id,
            d.node_id,
            d.workflow_id,
            d.prompt,
            d.status,
            d.progress,
            d.result_image_url,
            d.error_reason,
            d.started_at,
            d.finished_at,
            d.time_taken_ms,
            n.name AS node_name,
            n.url AS node_url,
            w.name AS workflow_name
        FROM draw_logs d
        LEFT JOIN nodes n ON n.id = d.node_id
        LEFT JOIN workflows w ON w.id = d.workflow_id
        {where_sql}
        ORDER BY d.started_at DESC
        LIMIT ?
        """,
        tuple(params),
    )

    return [dict(r) for r in rows]



@router.get("/nodes/{node_id}/workflows")
async def get_node_workflows(node_id: str, current_user: dict = Depends(get_current_user)):
    row = db.fetchone("SELECT url FROM nodes WHERE id = ?", (node_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Node not found")

    comfy_url = row["url"].rstrip("/")
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{comfy_url}/pysssss/workflows", timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return {"status": "success", "workflows": data}
                else:
                    return {"status": "success", "workflows": []}
        except Exception as e:
            return {"status": "success", "workflows": [], "error": str(e)}


@router.get("/nodes/{node_id}/workflows/{name:path}")
async def get_node_workflow_detail(node_id: str, name: str, current_user: dict = Depends(get_current_user)):
    row = db.fetchone("SELECT url FROM nodes WHERE id = ?", (node_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Node not found")

    comfy_url = row["url"].rstrip("/")
    import urllib.parse
    encoded_name = urllib.parse.quote(name)
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{comfy_url}/pysssss/workflows/{encoded_name}", timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data
                else:
                    raise HTTPException(status_code=resp.status, detail="Workflow not found on remote node")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
@router.post("/draw_logs/sync")
async def sync_draw_log(
    task_id: str = Query(...),
    status: str = Query(...),
    progress: int = Query(0),
    error_reason: str = Query(""),
    result_image_url: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    if status == "completed":
        db.execute(
            """
            UPDATE draw_logs
            SET status = ?, progress = ?, result_image_url = ?, finished_at = CURRENT_TIMESTAMP,
                time_taken_ms = CAST((julianday(CURRENT_TIMESTAMP) - julianday(started_at)) * 86400000 AS INTEGER)
            WHERE task_id = ?
            """,
            (status, 100 if progress <= 0 else progress, result_image_url, task_id),
        )
    elif status == "failed":
        db.execute(
            """
            UPDATE draw_logs
            SET status = ?, progress = ?, error_reason = ?, finished_at = CURRENT_TIMESTAMP,
                time_taken_ms = CAST((julianday(CURRENT_TIMESTAMP) - julianday(started_at)) * 86400000 AS INTEGER)
            WHERE task_id = ?
            """,
            (status, progress, error_reason, task_id),
        )
    else:
        db.execute(
            "UPDATE draw_logs SET status = ?, progress = ? WHERE task_id = ?",
            (status, progress, task_id),
        )

    return {"status": "ok"}


@router.post("/generate")
async def generate_workflow(
    workflow: Dict[str, Any],
    node_id: str = Query(...),
    workflow_id: str = Query(None),
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
                    prompt_id = data.get("prompt_id")
                    if prompt_id:
                        try:
                            local_id = str(uuid.uuid4())
                            db.execute(
                                "INSERT INTO draw_logs (id, task_id, node_id, workflow_id, status) VALUES (?, ?, ?, ?, ?)",
                                (local_id, prompt_id, node_id, workflow_id or "", "pending")
                            )
                        except Exception as e:
                            print(f"Failed to insert draw_logs: {e}")
                    return {"status": "success", "prompt_id": prompt_id}
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


@router.get("/nodes/{node_id}/logs")
async def get_node_logs(node_id: str, current_user: dict = Depends(get_admin_user)):
    row = db.fetchone("SELECT url FROM nodes WHERE id = ?", (node_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Node not found")

    comfy_url = row["url"].rstrip("/")
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{comfy_url}/history") as resp:
                data = await resp.json()
                # Format the history as text logs
                logs = f"--- Node {row['url']} Recent Run Logs ---\n"
                count = 0
                for prompt_id, item in list(data.items())[-20:]: # Last 20 items
                    logs += f"[Task {prompt_id}]\n  Status: {'Completed with outputs' if 'outputs' in item else 'Failed/Unknown'}\n"
                    count += 1
                if count == 0:
                    logs += "No recent tasks found on this node."
                return {"logs": logs}
        except Exception as e:
            return {"logs": f"Failed to connect to node: {str(e)}\n\nPlease check if the node is running and the URL is correct."}
