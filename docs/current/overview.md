# ComfyUI-Manager Refactoring Project

## 目標
使用 Python (后端) 与 React (前端) 对目前的项目进行全新重构。前端界面对齐 Civitai 风格，具备现代化、网格化模型展示，下载功能参考 ComfyUI-Model-Downloader。后端重新设计 RESTful/WebSocket 接口支持上述前端。

## 主要指标 (KPI)
- 语言框架: Python (FastAPI/Aiohttp) + React 18 (Vite, TS, Tailwind CSS)
- 管理员界面: 参考 `C:\git\ncqq-manager` 样式
- 对外界面: 参考 `civitai` 样式
- 后端架构: 支持并发下载、断点续传、进度推送、本地模型同步
- 模块分离: 前后端彻底分离，API 驱动

## 推荐复刻参考项目
- `ComfyUI-Model-Downloader` (前端下载交互)
- `tiangolo/full-stack-fastapi-template` (全栈脚手架参考)
- `civitai/civitai` (Civitai 前端布局与交互)

## 更新时间
Updated: 2026-03-24T06:00:00Z
