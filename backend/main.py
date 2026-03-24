from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.config import app_config
from backend.services.database import init_db
from backend.routers.auth_router import router as auth_router
from backend.routers.settings_router import router as settings_router
from backend.routers.node_router import router as node_router
from backend.routers.model_router import router as model_router
from backend.routers.workflow_router import router as workflow_router
from backend.services.log import logger

app = FastAPI(title="ComfyUI Manager API", version="0.1.0")

# 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting ComfyUI Manager API...")
    init_db()
    app_config.load_runtime_from_db()


app.include_router(auth_router)
app.include_router(settings_router)
app.include_router(node_router)
app.include_router(model_router)
app.include_router(workflow_router)
from backend.routers.ws_router import router as ws_router
app.include_router(ws_router)


# 配置前端静态资源托管
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist"
)

if os.path.exists(FRONTEND_DIST):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # 如果请求的是 API 或 WS，跳过处理 (FastAPI router 会优先处理 /api 和 /ws)
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return None

        # 尝试返回对应的静态文件
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # 所有其他的路由全部回退到 index.html 以支持 React Router 单页应用
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


@app.get("/")
async def root():
    # 如果没有挂载静态页面，默认返回 API 欢迎信息
    if os.path.exists(FRONTEND_DIST):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
    return {"message": "Welcome to ComfyUI Manager API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app, host=app_config.get("host", "0.0.0.0"), port=app_config.get("port", 8000)
    )
