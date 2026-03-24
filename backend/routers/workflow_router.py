import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import backend.services.database as db
from ..middleware.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/api", tags=["workflows"])


class WorkflowItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    json_data: str


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    json_data: str


@router.get("/workflows", response_model=List[WorkflowItem])
async def get_workflows(current_user: dict = Depends(get_current_user)):
    rows = db.fetchall(
        "SELECT id, name, description, json_data FROM workflows ORDER BY created_at DESC"
    )
    workflows = [
        {
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "json_data": r["json_data"],
        }
        for r in rows
    ]
    return workflows


@router.post("/workflows", response_model=WorkflowItem)
async def create_workflow(
    req: WorkflowCreate, current_user: dict = Depends(get_admin_user)
):
    wf_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO workflows (id, name, description, json_data) VALUES (?, ?, ?, ?)",
        (wf_id, req.name, req.description, req.json_data),
    )
    return {
        "id": wf_id,
        "name": req.name,
        "description": req.description,
        "json_data": req.json_data,
    }


@router.put("/workflows/{wf_id}", response_model=WorkflowItem)
async def update_workflow(
    wf_id: str, req: WorkflowCreate, current_user: dict = Depends(get_admin_user)
):
    row = db.fetchone("SELECT id FROM workflows WHERE id = ?", (wf_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")

    db.execute(
        "UPDATE workflows SET name = ?, description = ?, json_data = ? WHERE id = ?",
        (req.name, req.description, req.json_data, wf_id),
    )
    return {
        "id": wf_id,
        "name": req.name,
        "description": req.description,
        "json_data": req.json_data,
    }


@router.delete("/workflows/{wf_id}")
async def delete_workflow(wf_id: str, current_user: dict = Depends(get_admin_user)):
    db.execute("DELETE FROM workflows WHERE id = ?", (wf_id,))
    return {"status": "ok"}
