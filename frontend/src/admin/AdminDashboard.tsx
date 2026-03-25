import { useEffect, useState } from "react";
import axios from "axios";
import { useStore } from "../store";

import TasksPanel from "./components/TasksPanel";
import LocalModelsPanel from "./components/LocalModelsPanel";
import MarketPanel from "./components/MarketPanel";
import WorkflowsPanel from "./components/WorkflowsPanel";
import DrawLogsPanel from "./components/DrawLogsPanel";
import PlaygroundPanel from "./components/PlaygroundPanel";
import NodesPanel from "./components/NodesPanel";
import SettingsPanel from "./components/SettingsPanel";

export default function AdminDashboard() {
  const { logout, setSystemSettings } = useStore();
  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => {
    // 初始加载系统设置和节点配置
    axios.get("/api/settings").then(res => {
      setSystemSettings((prev: any) => ({ ...prev, ...res.data }));
    }).catch(console.error);
    axios.get("/api/nodes").then(res => {
      setSystemSettings((prev: any) => ({...prev, nodes: res.data}));
    }).catch(console.error);
  }, [setSystemSettings]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-800">
      {/* 侧边栏 */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex-col hidden md:flex shadow-sm z-10">
        <div className="h-14 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg leading-none">C</span>
          </div>
          <h1 className="text-[15px] font-bold text-gray-800 tracking-wide">ComfyUI Manager</h1>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {/* 控制台 分组 */}
          <div className="pt-2 pb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">控制台</p>
          </div>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            下载任务
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'playground' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            绘图
          </button>
          <button
            onClick={() => setActiveTab("drawlogs")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drawlogs' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            绘图日志
          </button>

          {/* 资源管理 分组 */}
          <div className="pt-4 pb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">资源管理</p>
          </div>
          <button
            onClick={() => setActiveTab("local")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'local' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            本地模型
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'market' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            Civitai 市场
          </button>
          <button
            onClick={() => setActiveTab("workflows")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'workflows' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            工作流模板
          </button>

          {/* 管理员 分组 */}
          <div className="pt-4 pb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">管理员</p>
          </div>
          <button
            onClick={() => setActiveTab("nodes")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'nodes' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            节点管理
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            系统设置
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <a href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            前台展厅
          </a>
          <button onClick={logout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 顶部 Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center text-sm font-medium text-gray-600">
            {activeTab === 'tasks' && "控制台 / 下载任务"}
            {activeTab === 'playground' && "控制台 / 绘图"}
            {activeTab === 'drawlogs' && "控制台 / 绘图日志"}
            {activeTab === 'local' && "资源管理 / 本地模型"}
            {activeTab === 'market' && "资源管理 / Civitai 市场"}
            {activeTab === 'workflows' && "资源管理 / 工作流模板"}
            {activeTab === 'nodes' && "管理员 / 节点管理"}
            {activeTab === 'settings' && "管理员 / 系统设置"}
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* 页面内容区 */}
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {/* 可选：通知 Banner */}
          {activeTab === 'market' ? (
            <MarketPanel />
          ) : activeTab === 'workflows' ? (
            <WorkflowsPanel setActiveTab={setActiveTab} />
          ) : activeTab === 'drawlogs' ? (
            <DrawLogsPanel />
          ) : activeTab === 'playground' ? (
            <PlaygroundPanel />
          ) : activeTab === 'nodes' ? (
            <NodesPanel />
          ) : activeTab === 'settings' ? (
            <SettingsPanel />
          ) : (
            activeTab === 'local' ? <LocalModelsPanel /> : <TasksPanel />
          )}
        </div>
      </main>
    </div>
  );
}
