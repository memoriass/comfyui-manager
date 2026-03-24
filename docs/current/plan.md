# Component Extraction Plan

## Scope
The goal is to split `frontend/src/admin/AdminDashboard.tsx` into multiple independent panel components.
Each panel component will encapsulate its own specific state and markup, simplifying the main dashboard file to act purely as a layout container and routing switch.
Global state (e.g. `systemSettings`) has already been relocated to `useStore` in `frontend/src/store.ts`.

## Affected Files
- `frontend/src/admin/AdminDashboard.tsx`
- `frontend/src/admin/components/TasksPanel.tsx` (New)
- `frontend/src/admin/components/LocalModelsPanel.tsx` (New)
- `frontend/src/admin/components/MarketPanel.tsx` (New)
- `frontend/src/admin/components/WorkflowsPanel.tsx` (New)
- `frontend/src/admin/components/DrawLogsPanel.tsx` (New)
- `frontend/src/admin/components/PlaygroundPanel.tsx` (New)
- `frontend/src/admin/components/NodesPanel.tsx` (New)
- `frontend/src/admin/components/SettingsPanel.tsx` (New)
- `frontend/src/admin/components/ModelDetailModal.tsx` (New)

# 阶段 5：组件级抽离与样式重构 (Completed)
1. 创建 `frontend/src/admin/components` 目录。
2. 将 `AdminDashboard.tsx` 内部约 600 行的庞大条件渲染代码剥离，拆分出 8 个单独的面版组件（`TasksPanel`, `LocalModelsPanel`, `MarketPanel`, `NodesPanel` 等）。
3. 补全各面板组件缺少的内联状态与 API 依赖，实现自给自足。
4. 全面修复了 JSX 结构闭合错误，优化了各个面板组件内部的样式与网格布局体验。
5. 最终 `AdminDashboard.tsx` 减重到仅保留壳子与侧边栏路由配置。

---
# 阶段 1：架构与初始化重构 (Completed)
1. 创建 `backend/services/config.py` 和 `backend/services/database.py`，实现与 ncqq-manager 类似的初始化与双重配置加载机制
2. 创建 `backend/services/user_manager.py` 和 `backend/middleware/auth.py`
3. 重构现有路由至 `backend/routers`（auth_router, model_router, node_router, settings_router）
4. 重构 `backend/main.py` 以适配全新的多路由模块加载

# 阶段 2：后端业务逻辑迁移 (Completed)
1. 将基于 JSON 的简单账号密码验证和多节点配置，全面迁移至基于 SQLite 数据库的持久化管理
2. 打通 `/api/setup/status` 和 `/api/setup/init` 初始化向导接口
3. 弃用原 `backend/api/` 结构并清理

# 阶段 3：前端配置页面支持 (Completed)
1. 在前端支持 `/setup` 页面，若检测到未初始化则展示此页面强制引导
2. 将原有“系统设置”的设置项与新后端的 `settings` 和 `nodes` API 对接
3. 确保前端整体状态管理不受影响

# 阶段 4：前台及控制台样式复刻 (Completed)
1. 为 `HomePage.tsx` 展厅添加 Civitai 样式顶部筛选分栏
2. 为 `AdminDashboard.tsx` 市场页面复刻相同筛选分栏
3. 修改后端 API 兼容带参数的不同分类模型查询


# 阶段 6：WebSocket 生图日志实时推送 (Completed)
1. 修复后端 `ws_router.py` WebSocket 路由路径由 `/ws/tasks` 变更为 `/ws/draws`，避免与模型下载列表的 WebSocket 冲突。
2. 后端正确解析 ComfyUI `execution_start` 携带的 `prompt_id` 并向下传递给无 ID 的 `progress` 事件。
3. 前端 Zustand Store 增加 `drawTasks` 数据源并对接 WebSocket 监听 `/ws/draws`。
4. 前端 `DrawLogsPanel.tsx` 页面不再显示空白搜索结果，实时展示渲染服务器下发的当前绘图状态、进度与耗时。