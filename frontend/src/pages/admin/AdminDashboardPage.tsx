import { useEffect, useState } from "react";

import { useAppStore } from "../../app/store/useAppStore";
import { fetchNodes, fetchSystemSettings } from "../../features/system/api/systemApi";
import DrawLogsPanel from "../../admin/components/DrawLogsPanel";
import LocalModelsPanel from "../../admin/components/LocalModelsPanel";
import MarketPanel from "../../admin/components/MarketPanel";
import NodesPanel from "../../admin/components/NodesPanel";
import PlaygroundPanel from "../../admin/components/PlaygroundPanel";
import SettingsPanel from "../../admin/components/SettingsPanel";
import TasksPanel from "../../admin/components/TasksPanel";
import WorkflowsPanel from "../../admin/components/WorkflowsPanel";

const tabs = [
  { key: "tasks", group: "控制台", label: "下载任务", title: "控制台 / 下载任务" },
  { key: "playground", group: "控制台", label: "绘图", title: "控制台 / 绘图" },
  { key: "drawlogs", group: "控制台", label: "绘图日志", title: "控制台 / 绘图日志" },
  { key: "local", group: "资源管理", label: "本地模型", title: "资源管理 / 本地模型" },
  { key: "market", group: "资源管理", label: "Civitai 市场", title: "资源管理 / Civitai 市场" },
  { key: "workflows", group: "资源管理", label: "工作流模板", title: "资源管理 / 工作流模板" },
  { key: "nodes", group: "管理员", label: "节点管理", title: "管理员 / 节点管理" },
  { key: "settings", group: "管理员", label: "系统设置", title: "管理员 / 系统设置" },
] as const;

type AdminTabKey = (typeof tabs)[number]["key"];

function renderPanel(activeTab: AdminTabKey, setActiveTab: (tab: AdminTabKey) => void) {
  switch (activeTab) {
    case "market":
      return <MarketPanel />;
    case "workflows":
      return <WorkflowsPanel setActiveTab={setActiveTab} />;
    case "drawlogs":
      return <DrawLogsPanel />;
    case "playground":
      return <PlaygroundPanel />;
    case "nodes":
      return <NodesPanel />;
    case "settings":
      return <SettingsPanel />;
    case "local":
      return <LocalModelsPanel />;
    default:
      return <TasksPanel />;
  }
}

export default function AdminDashboardPage() {
  const { logout, setSystemSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("tasks");

  useEffect(() => {
    Promise.all([fetchSystemSettings(), fetchNodes()])
      .then(([settings, nodes]) => {
        setSystemSettings((prev) => ({ ...prev, ...settings, nodes }));
      })
      .catch(() => undefined);
  }, [setSystemSettings]);

  const activeTabTitle = tabs.find((tab) => tab.key === activeTab)?.title ?? "控制台 / 下载任务";
  const groups = Array.from(new Set(tabs.map((tab) => tab.group)));

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-800">
      <aside className="w-[240px] bg-white border-r border-gray-200 flex-col hidden md:flex shadow-sm z-10">
        <div className="h-14 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg leading-none">C</span>
          </div>
          <h1 className="text-[15px] font-bold text-gray-800 tracking-wide">ComfyUI Manager</h1>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {groups.map((group) => (
            <div key={group}>
              <div className="pt-2 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group}</p>
              </div>
              {tabs
                .filter((tab) => tab.group === group)
                .map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <a href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            前台展厅
          </a>
          <button onClick={logout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center text-sm font-medium text-gray-600">{activeTabTitle}</div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {renderPanel(activeTab, setActiveTab)}
        </div>
      </main>
    </div>
  );
}

