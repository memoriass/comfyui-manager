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
