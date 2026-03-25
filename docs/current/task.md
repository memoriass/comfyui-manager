- commit=none diff=+0/-0 commands=`move old` evidence=`Get-ChildItem -Exclude old, .git | Move-Item -Destination old`
- remeber.intake.1 `label=scope|fact=moved to old|impact=fresh start|next=create structure`
- remeber.intake.2 `label=tech|fact=Python + React|impact=full rewrite|next=propose plan`
- remeber.intake.3 `label=ui|fact=Civitai clone|impact=masonry grid, dark mode|next=Frontend UI design`
- remeber.intake.4 `label=backend|fact=fastapi or aiohttp|impact=async downloads|next=Backend architecture`
- commit=none diff=+X/-0 commands=`FastAPI + React init` evidence=`App.tsx, router.py`
- remeber.exec.1 `label=backend|fact=FastAPI setup|impact=Provides API and WebSocket|next=Database integration`
- remeber.exec.2 `label=frontend|fact=React Vite setup|impact=Two different layouts|next=Refine UI`
- remeber.exec.3 `label=civitai|fact=Dark masonry mode|impact=Public view ready|next=Real data source`
- remeber.exec.4 `label=admin|fact=Dashboard view|impact=Management ready|next=Local file sync`
- remeber.exec.5 `label=ws|fact=WebSocket progress|impact=Realtime download tracking|next=Error handling`
- commit=none diff=+140/-0 commands=`create start.py` evidence=`start.py banner and CLI`
- remeber.exec.6 `label=deploy|fact=start.py created|impact=one-click deployment|next=test the script`
- commit=none diff=+14/-6 commands=`fix start.py Windows node check` evidence=`shell=is_win in subprocess`
- remeber.exec.7 `label=fix|fact=Windows npm missing|impact=start script fixed|next=verify UI`
- commit=none diff=+140/-70 commands=`port models.py and downloader.py` evidence=`aiohttp stream and civitai mapping`
- remeber.exec.8 `label=port|fact=civitai real api|impact=public UI showing real models|next=handle pagination`
- remeber.exec.9 `label=port|fact=local models scanning|impact=admin can see models|next=plugins`
- remeber.exec.10 `label=port|fact=real async download chunking|impact=proper file saving|next=pause and resume`

- remeber.summary `label=frontend|fact=completed modern dashboard refactor|impact=better admin UX|next=workflows`
- commit=none diff=+X/-Y commands=`refactor frontend display logic` evidence=`AdminDashboard.tsx market, HomePage.tsx local side panel`
- remeber.exec.11 `label=frontend|fact=HomePage shows local models|impact=read-only gallery for ComfyUI user|next=workflows`
- remeber.exec.12 `label=frontend|fact=Admin manages Civitai download|impact=separation of concerns|next=UI tweaks`
- remeber.exec.13 `label=backend|fact=downloader saves .json and .preview.png|impact=ComfyUI native integration|next=error handling`
- commit=none diff=+3/-3 commands=`fix TS errors & build` evidence=`store.ts str->string`
- commit=`Admin UI Refactor` diff=`+200/-100` commands=`npm run build OK` evidence=`AdminDashboard.tsx L300`
- remeber.exec.17 `label=ui|fact=AdminDashboard fully refactored to modern tailwind style|impact=better user experience|next=workflows`
- remeber.exec.18 `label=build|fact=TypeScript build passes 100%|impact=production ready|next=workflows feature`

- remeber.exec.14 `label=frontend|fact=fixed TypeScript issues|impact=build succeeds|next=run server`
- commit=none diff=+X/-Y commands=`add authentication and UI logic` evidence=`backend/api/auth.py, frontend/src/admin/LoginPage.tsx`
- remeber.exec.15 `label=backend|fact=JWT login endpoint implemented|impact=protects admin routes|next=admin UI enhancements`
- remeber.exec.16 `label=frontend|fact=Zustand token handling added|impact=persists login session|next=integrate search`
- remeber.exec.17 `label=frontend|fact=market search & model deletion added|impact=fulfills requested UI functionality|next=deliver MVP`
- commit=none diff=+X/-Y commands=`move models config to data` evidence=`backend/api/router.py, start.py`
- commit=none diff=+X/-Y commands=`add config logic and playground` evidence=`config.py, AdminDashboard.tsx`
- remeber.exec.20 `label=feature|fact=added api settings to config.json|impact=user can config model paths|next=None`
- commit=none diff=+X/-Y commands=`add drawing tab and settings` evidence=`config.py, AdminDashboard.tsx`
- remeber.exec.22 `label=feature|fact=added comfyui api config|impact=connects to remote instances|next=workflows`
- remeber.exec.23 `label=ui|fact=added drawing console tab|impact=playground for generating image|next=workflows`
- commit=none diff=+X/-Y commands=`added node list logic` evidence=`config.py, router.py, AdminDashboard.tsx`
- remeber.exec.25 `label=feature|fact=added multi-node support|impact=can switch nodes to send workflows|next=workflows`
- commit=none diff=+X/-Y commands=`added workflow generate api` evidence=`router.py, AdminDashboard.tsx`
- remeber.exec.27 `label=feature|fact=added POST /generate to forward workflows|impact=can send actual prompt to comfyui|next=workflows`
- commit=none diff=+X/-Y commands=`added admin credentials to config` evidence=`config.py, auth.py, AdminDashboard.tsx`
- remeber.exec.29 `label=feature|fact=added admin username and password to config|impact=users can change login via settings|next=workflows`
- commit=none diff=+X/-Y commands=`added proxy and civitai key config` evidence=`config.py, router.py, downloader.py, AdminDashboard.tsx`
- remeber.exec.31 `label=feature|fact=added http_proxy and civitai_api_key|impact=users can download restricted models and bypass network issues|next=workflows`
- commit=none diff=+X/-Y commands=`auto generate config.json on load` evidence=`config.py`
- remeber.exec.33 `label=feature|fact=config.json auto generates|impact=users can see and edit config.json immediately on startup|next=workflows`
- commit=none diff=+X/-Y commands=`backend refactoring commands` evidence=`backend/routers`
- remeber.exec.1 `label=scope|fact=db+router|impact=ncqq-like init flow applied|next=test`
- remeber.exec.2 `label=frontend|fact=SetupPage.tsx created|impact=can trigger /setup when initialized=false|next=deploy`
- remeber.exec.3 `label=clean|fact=backend/api/ deleted|impact=cleaned up messy structure|next=done`
- remeber.summary `label=done|fact=backend completely modularized with sqlite, frontend supports setup initialization like ncqq-manager|impact=system is ready for production scaling|next=maintain`
- commit=`Update categories` diff=`+150/-150` commands=`npm run build OK` evidence=`HomePage.tsx, AdminDashboard.tsx, model_router.py`
- remeber.exec.4 `label=ui|fact=Replicated Civitai top bar|impact=Filter models easily|next=done`
- commit=`Frontend & Backend UI/API Refactor` diff=`+200/-50` commands=`npm run build; ruff check; ruff format` evidence=`frontend/src/admin/AdminDashboard.tsx, frontend/src/index.css, backend/routers/workflow_router.py, backend/routers/node_router.py`
- remeber.exec.5 `label=ui|fact=fixed category filter bug by aligning names|impact=filters work correctly|next=workflows`
- remeber.exec.6 `label=ui|fact=added custom scrollbar|impact=better horizontal scrolling UX|next=workflows`
- remeber.exec.7 `label=backend|fact=added workflow CRUD and node PUT|impact=can manage workflows and nodes|next=workflows`
- remeber.exec.8 `label=ui|fact=fixed node management tab and sidebar item|impact=nodes can be managed separately|next=done`
- remeber.exec.9 `label=ui|fact=grouped sidebar items into sections|impact=roles and permissions ready|next=done`
- remeber.exec.10 `label=ui|fact=added drawlogs ui|impact=admin can view drawing logs history|next=done`
- remeber.exec.11 `label=ui|fact=redesigned node management ui|impact=nodes shown as cards with auth settings|next=done`
- remeber.exec.12 `label=backend|fact=added auth fields to db and routes|impact=backend can store basic auth or token for nodes|next=done`
- remeber.summary `label=done|fact=Node management refactored into ncqq card style with auth support|impact=Better UX and security preparation|next=done`
- remeber.exec.13 `label=ws|fact=added ws proxy router in backend|impact=can listen to comfyui ws events|next=done`
- remeber.exec.14 `label=ui|fact=updated local models ui to match market|impact=looks much better with masonry grid|next=done`
- remeber.exec.15 `label=ui|fact=added modal for model details|impact=clicking card shows local/market details|next=done`
- commit=`Extract components` diff=`+500/-800` commands=`npm run build OK` evidence=`AdminDashboard.tsx L164`
- remeber.exec.16 `label=refactor|fact=AdminDashboard split into 8 sub-components|impact=highly maintainable architecture|next=check backend`
- remeber.exec.17 `label=ui|fact=PlaygroundPanel styled and typed|impact=isolated logic|next=check backend`
- remeber.exec.18 `label=ui|fact=SettingsPanel moved to component|impact=isolated logic|next=check backend`
- remeber.exec.19 `label=ui|fact=MarketPanel and WorkflowsPanel refactored|impact=cleaner codebase|next=check backend`
- remeber.summary `label=done|fact=Frontend React component extraction completed successfully|impact=Code size reduced and modularity increased|next=done`
- commit=`Fix WS Drawing Progress` diff=`+50/-20` commands=`ruff check && npm run build` evidence=`backend/routers/ws_router.py L85`
- remeber.exec.20 `label=ws|fact=ws_router decoupled from /ws/tasks to /ws/draws|impact=model download ws no longer conflicts with comfyui ws|next=DrawLogsPanel`
- remeber.exec.21 `label=ws|fact=added drawTasks state to Zustand|impact=frontend receives drawing progress separately from model downloads|next=DrawLogsPanel`
- remeber.exec.22 `label=ui|fact=DrawLogsPanel connected to useStore().drawTasks|impact=shows real-time execution progress from ComfyUI|next=done`
- remeber.summary `label=ws|fact=ComfyUI execution progress broadcasted to frontend|impact=Real-time draw logging is functional|next=local models ui`
- commit=Fix NodesPanel and LocalModelsPanel diff=+180/-120 commands=npm run build OK evidence=NodesPanel.tsx L50
- remeber.exec.23 label=ui|fact=LocalModelsPanel now uses iframe to visit Civitai specific page directly|impact=fulfills requirement|next=nodes save fix
- remeber.exec.24 label=fix|fact=NodesPanel lost config bug fixed|impact=UUID local node handled correctly without overwriting|next=nodes settings independent save
- remeber.exec.25 label=ui|fact=Node card layout updated to ncqq style with independent save buttons|impact=independent settings save implemented|next=run logs
- remeber.exec.26 label=backend|fact=added GET /api/nodes/{id}/logs|impact=can fetch recent run logs via ComfyUI history API|next=done
- remeber.summary label=done|fact=Fixed all reported bugs and finished UI alignments including run logs integration|impact=App is robust and matches requested features|next=done

- commit=`none` diff=`+248/-48` commands=`npm run build OK; python -m py_compile backend/routers/node_router.py OK` evidence=`PlaygroundPanel.tsx L24-L251; node_router.py L73-L105`
- remeber.exec.27 `label=playground|fact=added workflow parameter parsing + form/json dual mode + preset loader|impact=workflow can be edited visually before send|next=real machine verify`
- remeber.exec.28 `label=backend|fact=/api/generate accepts workflow_id and inserts draw_logs pending record using prompt_id|impact=draw task lifecycle now has db start record|next=join ws updates`
- remeber.exec.29 `label=verify|fact=frontend build and backend py_compile passed|impact=current changes are build-safe|next=manual联调192.168.1.215:8188`

- commit=`4a3b9bd` diff=`+180/-100` commands=`npm run build OK` evidence=`DrawLogsPanel.tsx L15-L50`
- remeber.exec.30 `label=api|fact=added /api/draw_logs to node_router|impact=provides history logs|next=merge in frontend`
- remeber.exec.31 `label=ws|fact=added draw_logs update in ws_router|impact=realtime logs are persisted|next=merge in frontend`
- remeber.exec.32 `label=frontend|fact=merged realtime and history logs in DrawLogsPanel|impact=seamless user experience for realtime and history logs|next=done`
- remeber.summary `label=complete|fact=DrawLogs lifecycle done|impact=can inspect drawing progress and history|next=next task`
- commit=`a46428b` diff=`+83/-7` commands=`npm run build OK` evidence=`NodesPanel.tsx; store.ts L41; PlaygroundPanel.tsx`
- remeber.exec.33 `label=fix|fact=setSystemSettings accepts function in store.ts|impact=NodesPanel Add Node button works now|next=remote workflows`
- remeber.exec.34 `label=feature|fact=added GET /nodes/{node_id}/workflows proxy|impact=can fetch remote node pysssss workflows|next=playground ui`
- remeber.exec.35 `label=frontend|fact=PlaygroundPanel loads and groups remote workflows dynamically|impact=users can select remote node workflows directly in playground|next=done`
- remeber.summary `label=nodes|fact=fixed add node and added remote workflow proxy|impact=Nodes management is robust and workflow selection is flexible|next=next task`




- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

- commit=unknown diff=+200/-50 commands=
pm run build; python -m py_compile evidence=downloader.py L15
    - remeber.exec.30 label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none
    - remeber.exec.31 label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none
    - remeber.exec.32 label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done

- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

 -   c o m m i t = \ u n k n o w n \   d i f f = \ + 2 0 0 / - 5 0 \   c o m m a n d s = \ 
 p m   r u n   b u i l d ;   p y t h o n   - m   p y _ c o m p i l e \   e v i d e n c e = \ d o w n l o a d e r . p y   L 1 5 \ 
         -   r e m e b e r . e x e c . 3 0   \ l a b e l = b a t c h | f a c t = A d d e d   P l a y g r o u n d   b a t c h   l o o p   s u p p o r t | i m p a c t = f r o n t e n d   a u t o   s u b m i t   m u l t i p l e   j o b s | n e x t = n o n e \ 
         -   r e m e b e r . e x e c . 3 1   \ l a b e l = d o w n l o a d e r | f a c t = A d d e d   a s y n c i o . S e m a p h o r e ( 3 )   l i m i t | i m p a c t = n o   I P   b a n   f r o m   c i v i t a i | n e x t = n o n e \ 
         -   r e m e b e r . e x e c . 3 2   \ l a b e l = s t a t s | f a c t = A d d e d   s p e e d   /   t o t a l _ b y t e s   t o   T a s k P a n e l | i m p a c t = u s e r   s e e s   d o w n l o a d   r a t e s | n e x t = d o n e \ 
  
 \n- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`\n    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`\n    - remeber.exec#1 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`\n    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`\n\n- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`\n    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`\n    - remeber.exec#1 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`\n    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`\n
- commit=`unknown` diff=`+200/-50` commands=`npm run build; python -m py_compile` evidence=`downloader.py L15`
    - remeber.exec.30 `label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none`
    - remeber.exec.31 `label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none`
    - remeber.exec.32 `label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done`

- commit=unknown diff=+200/-50 commands=npm run build; python -m py_compile evidence=downloader.py L15
    - remeber.exec.30 label=batch|fact=Added Playground batch loop support|impact=frontend auto submit multiple jobs|next=none
    - remeber.exec.31 label=downloader|fact=Added asyncio.Semaphore(3) limit|impact=no IP ban from civitai|next=none
    - remeber.exec.32 label=stats|fact=Added speed / total_bytes to TaskPanel|impact=user sees download rates|next=done
