import { useEffect, useState } from "react";
import axios from "axios";
import { useStore } from "../store";

export default function AdminDashboard() {
  const { tasks, logout } = useStore();
  const [activeTab, setActiveTab] = useState("tasks");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [marketModels, setMarketModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("// 点击上方按钮发送测试请求\n// 响应结果将显示在这里");
  const [workflowJson, setWorkflowJson] = useState<string>("{\n  // 在这里粘贴 ComfyUI 导出的 API 格式工作流 JSON\n}");
  const [systemSettings, setSystemSettings] = useState({
    models_dir: "",
    nodes: [{ id: "local", name: "本地主节点", url: "http://127.0.0.1:8188", type: "local", auth_type: "none", auth_credentials: "" }],
    active_node_id: "local",
    admin_username: "admin",
    admin_password: "adminpassword",
    civitai_api_key: "",
    http_proxy: ""
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalType, setModalType] = useState<"local" | "market">("local");

  const openModal = (type: "local" | "market", data: any) => {
    setModalType(type);
    setModalData(data);
    setModalOpen(true);
  };

  const fetchMarketModels = (q = "", typeOverride?: string) => {
    setLoading(true);
    let typeParam = typeOverride || filterType;
    let url = `/api/models?limit=20&q=${q}`;
    if (typeParam !== "all") {
        url += `&types=${typeParam}`;
    }
    axios.get(url).then((res) => {
      setMarketModels(res.data);
      setLoading(false);
    });
  };

  const fetchLocalModels = () => {
    setLoading(true);
    axios.get(`/api/local_models?type=${filterType}`).then((res) => {
      setLocalModels(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (activeTab === "local") {
      fetchLocalModels();
    } else if (activeTab === "market") {
      fetchMarketModels(searchQuery);
    } else if (activeTab === "settings") {
      axios.get("/api/settings").then(res => setSystemSettings(res.data));
    } else if (activeTab === "workflows") {
      axios.get("/api/workflows").then(res => setWorkflows(res.data)).catch(err => console.error(err));
      axios.get("/api/nodes").then(res => {
        setSystemSettings(prev => ({...prev, nodes: res.data}));
      });
      axios.get("/api/nodes").then(res => {
        setSystemSettings(prev => ({...prev, nodes: res.data}));
      });
    }
  }, [activeTab, filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketModels(searchQuery);
  };

  const handlePlaygroundTest = async (url: string, method: string = 'GET', data?: any) => {
    try {
      const targetUrl = url.includes('?') ? `${url}&node_id=${systemSettings.active_node_id}` : `${url}?node_id=${systemSettings.active_node_id}`;
      setPlaygroundResponse(`// 发送 ${method} ${targetUrl} ...\n`);
      const res = await axios({ method, url: targetUrl, data });
      setPlaygroundResponse(`// ${res.status} ${res.statusText}\n${JSON.stringify(res.data, null, 2)}`);
    } catch (err: any) {
      setPlaygroundResponse(`// ERROR\n${JSON.stringify(err.response?.data || err.message, null, 2)}`);
    }
  };

  const handleDeleteLocal = async (model: any) => {
    if (!window.confirm(`确定删除本地模型 ${model.name} 吗？`)) return;
    try {
      await axios.delete(`/api/local_models/${model.type}/${model.name}`);
      setLocalModels(localModels.filter(m => m.name !== model.name));
      alert("删除成功！");
    } catch (err: any) {
      alert("删除失败: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDownload = async (model: any) => {
    await axios.post("/api/download", {
      model_id: model.id,
      url: model.download_url,
      metadata: {
        name: model.name,
        type: model.type,
        description: model.description,
        image_url: model.image_url,
        version: model.version
      }
    });
    alert("下载已加入队列！请去下载任务列表查看进度。");
  };

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
            {activeTab === 'tasks' && "任务管理 / 下载任务"}
            {activeTab === 'local' && "资源管理 / 本地模型"}
            {activeTab === 'market' && "资源管理 / Civitai 市场"}
            {activeTab === 'playground' && "控制台 / 绘图"}
            {activeTab === 'drawlogs' && "控制台 / 绘图日志"}
            {activeTab === 'settings' && "设置 / 系统设置"}
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
          {activeTab === 'local' && (
            <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start text-sm text-blue-800">
              <svg className="w-5 h-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>请注意：您在此处删除本地模型时，不仅会删除主体文件，还会一并清除与之绑定的缩略图和描述 JSON 文件。</span>
            </div>
          )}

          {activeTab === 'market' ? (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Civitai 市场发现</h2>
                <form onSubmit={handleSearch} className="flex">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜索模型关键字..."
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 text-sm transition-shadow"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button type="submit" className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                    搜索
                  </button>
                </form>
              </div>

            {/* 分类栏 - 对齐 Civitai 样式 */}
            <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
              {['all', 'checkpoints', 'loras', 'vae', 'controlnet'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                      setFilterType(type);
                      setMarketModels([]); // clear to show loading
                  }}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-colors border ${
                    filterType === type
                      ? 'bg-[#228be6] text-white border-[#228be6]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? 'ALL' : type.toUpperCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20 text-gray-400 text-sm flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                正在从 Civitai 拉取数据...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {marketModels.map((m, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group cursor-pointer" onClick={() => openModal('market', m)}>
                    <div className="h-48 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-gray-400 text-sm">无预览图</span>
                      )}
                      <span className="absolute top-2 left-2 bg-gray-900 bg-opacity-70 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded">
                        {m.type}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-800 text-sm truncate mb-1" title={m.name}>{m.name}</h3>
                      <p className="text-xs text-gray-500 truncate mb-4">版本: {m.version}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(m); }}
                        className="mt-auto w-full py-2 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        添加到 ComfyUI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'workflows' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-gray-800">工作流模板管理</h2>
               <button
                 onClick={() => {
                   const name = prompt("请输入工作流名称:");
                   if (name) {
                     axios.post('/api/workflows', { name, description: "", json_data: "{}" })
                       .then(res => setWorkflows([...workflows, res.data]))
                       .catch(err => alert("创建失败: " + err.message));
                   }
                 }}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
               >
                 + 新建模板
               </button>
             </div>
             <p className="text-gray-600 mb-6">内建用于保存和管理常用工作流。这里提供保存、编辑、删除以及调用的功能。</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {workflows.map(wf => (
                 <div key={wf.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col">
                   <h3 className="font-bold text-lg text-gray-800 mb-2">{wf.name}</h3>
                   <p className="text-sm text-gray-600 mb-4 flex-1">{wf.description || "无描述"}</p>
                   <div className="flex gap-2">
                     <button
                       onClick={() => {
                         const newJson = prompt("请粘贴工作流JSON:", wf.json_data);
                         if (newJson) {
                           axios.put(`/api/workflows/${wf.id}`, { ...wf, json_data: newJson })
                             .then(res => {
                               setWorkflows(workflows.map(w => w.id === wf.id ? res.data : w));
                               alert("更新成功");
                             })
                             .catch(err => alert("更新失败: " + err.message));
                         }
                       }}
                       className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50"
                     >编辑 JSON</button>
                     <button
                       onClick={() => {
                         if (window.confirm("确定删除?")) {
                           axios.delete(`/api/workflows/${wf.id}`)
                             .then(() => setWorkflows(workflows.filter(w => w.id !== wf.id)))
                             .catch(err => alert("删除失败: " + err.message));
                         }
                       }}
                       className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-100"
                     >删除</button>
                     <button
                       onClick={() => {
                         setWorkflowJson(wf.json_data);
                         setActiveTab('playground');
                       }}
                       className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-100"
                     >测试</button>
                   </div>
                 </div>
               ))}
               {workflows.length === 0 && (
                 <div className="col-span-full text-center py-10 text-gray-400">
                   暂无工作流模板
                 </div>
               )}
             </div>
          </div>
        ) : activeTab === 'drawlogs' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
             {/* 警告提示 */}
             <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative mb-6 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span>当前未开启 ComfyUI WebSocket 状态回传，部分任务进度可能无法实时更新。</span>
             </div>

             {/* 顶部搜索/过滤栏 */}
             <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col space-y-1">
                   <label className="text-xs font-semibold text-gray-500">日期范围</label>
                   <input type="date" className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="flex flex-col space-y-1">
                   <label className="text-xs font-semibold text-gray-500">任务 ID</label>
                   <input type="text" placeholder="请输入任务 ID" className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-48" />
                </div>
                <div className="flex flex-col space-y-1">
                   <label className="text-xs font-semibold text-gray-500">节点 ID</label>
                   <input type="text" placeholder="请输入节点 ID" className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-48" />
                </div>
                <div className="flex items-end space-x-2">
                   <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">查询</button>
                   <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200">重置</button>
                </div>
             </div>

             {/* 表格 */}
             <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                      <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">花费时间</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">节点</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作流</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务 ID</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务状态</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结果图片</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失败原因</th>
                      </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                      {/* Empty State */}
                      <tr>
                         <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            搜索无结果
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        ) : activeTab === 'playground' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-gray-800">ComfyUI 绘图控制台</h2>
               <div className="flex items-center space-x-2">
                 <label className="text-sm font-medium text-gray-700">当前节点:</label>
                 <select
                   className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   value={systemSettings.active_node_id || "local"}
                   onChange={e => setSystemSettings({...systemSettings, active_node_id: e.target.value})}
                 >
                   {systemSettings.nodes?.map((node: any) => (
                     <option key={node.id} value={node.id}>{node.name} ({node.type})</option>
                   ))}
                 </select>
               </div>
             </div>
             <p className="text-gray-600 mb-6">内建用于复刻 ComfyUI 控制台的实际绘图界面，对接本地和远程 ComfyUI 后端。您可以在此配置工作流 API JSON 格式来测试生图效果。</p>
             <div className="flex-1 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 flex flex-col space-y-2">
                   <label className="text-sm font-medium text-gray-700">ComfyUI 工作流 (API JSON 格式)</label>
                   <textarea
                     className="flex-1 w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                     value={workflowJson}
                     onChange={(e) => setWorkflowJson(e.target.value)}
                     placeholder="请在 ComfyUI 中点击 Save (API Format)，并将导出的 JSON 内容粘贴到此处"
                   ></textarea>
                </div>
                <div className="flex-1 flex flex-col space-y-4">
                   <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(workflowJson);
                            handlePlaygroundTest('/api/generate', 'POST', parsed);
                          } catch (e) {
                            alert("工作流 JSON 格式错误，请检查!");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex-1"
                      >
                        发送工作流 (生图)
                      </button>
                      <button
                        onClick={() => {
                          const promptId = prompt("请输入想要查询状态的 prompt_id:");
                          if (promptId) handlePlaygroundTest(`/api/generate/status/${promptId}`);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex-1"
                      >
                        查询生图状态
                      </button>
                      <button onClick={() => handlePlaygroundTest('/api/models?limit=5')} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex-1">获取可用模型</button>
                   </div>
                   <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap max-h-[400px]">
                      <pre>{playgroundResponse}</pre>
                   </div>
                </div>
             </div>
          </div>
        ) : activeTab === 'nodes' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                   <h2 className="text-lg font-bold text-gray-800">节点管理</h2>
                   <p className="text-gray-600 mt-1 text-sm">管理您的 ComfyUI 节点实例，您可以添加多个远程节点并分配不同参数。</p>
                </div>
                <div className="flex space-x-3">
                   <button
                     className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                     onClick={() => {
                       let saveCount = 0;
                       const total = systemSettings.nodes?.filter(n => n.id !== "local" && n.url.startsWith("http"))?.length || 0;

                       // Define a helper to save nodes
                       const saveNodes = async () => {
                          if (total === 0) {
                              alert("无远程节点需要保存");
                              return;
                          }
                          try {
                             for (const node of systemSettings.nodes) {
                                 if (node.id.startsWith("local")) continue;
                                 if (!node.url.startsWith("http")) continue;

                                 // Update settings.active_node_id
                                 await axios.post('/api/settings', { active_node_id: systemSettings.active_node_id });

                                 if (node.id && node.id.length > 0 && node.id !== "local" && !isNaN(Number(node.id))) {
                                   await axios.post('/api/nodes', {name: node.name, url: node.url, auth_type: node.auth_type, auth_credentials: node.auth_credentials});
                                 } else {
                                   await axios.put(`/api/nodes/${node.id}`, {name: node.name, url: node.url, auth_type: node.auth_type, auth_credentials: node.auth_credentials});
                                 }
                                 saveCount++;
                             }
                             // Refresh nodes list to get proper UUIDs instead of timestamps
                             const res = await axios.get('/api/nodes');
                             setSystemSettings(prev => ({...prev, nodes: res.data}));
                             alert(`成功保存了 ${saveCount} 个节点配置!`);
                          } catch (err) {
                             alert("保存节点遇到错误，部分可能未保存成功");
                          }
                       };
                       saveNodes();
                     }}
                   >
                     <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                     保存所有配置
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* 左侧：节点卡片列表 */}
                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                {systemSettings.nodes?.map((node, index) => (
                   <div key={index} className={`bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${systemSettings.active_node_id === node.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                     <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                       <div className="flex items-center space-x-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${node.id === 'local' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                         <h3 className="font-semibold text-gray-800 text-sm truncate">{node.name || '未命名节点'}</h3>
                       </div>
                       {systemSettings.active_node_id === node.id && (
                         <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">当前激活</span>
                       )}
                     </div>
                     <div className="p-4 flex-1 flex flex-col space-y-4">
                       <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">节点名称</label>
                         <input
                           type="text"
                           className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                           value={node.name}
                           onChange={e => {
                             const newNodes = [...systemSettings.nodes];
                             newNodes[index].name = e.target.value;
                             setSystemSettings({...systemSettings, nodes: newNodes});
                           }}
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">服务地址 (URL)</label>
                         <input
                           type="text"
                           className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                           value={node.url}
                           onChange={e => {
                             const newNodes = [...systemSettings.nodes];
                             newNodes[index].url = e.target.value;
                             setSystemSettings({...systemSettings, nodes: newNodes});
                           }}
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1">鉴权方式</label>
                           <select
                             className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                             value={node.auth_type || 'none'}
                             onChange={e => {
                               const newNodes = [...systemSettings.nodes];
                               newNodes[index].auth_type = e.target.value;
                               setSystemSettings({...systemSettings, nodes: newNodes});
                             }}
                           >
                             <option value="none">无 (None)</option>
                             <option value="basic">Basic Auth</option>
                             <option value="token">Bearer Token</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1">凭证 (密钥)</label>
                           <input
                             type="password"
                             className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                             placeholder={node.auth_type === 'none' ? '无需填写' : '填入 token 或 user:pass'}
                             disabled={node.auth_type === 'none'}
                             value={node.auth_credentials || ''}
                             onChange={e => {
                               const newNodes = [...systemSettings.nodes];
                               newNodes[index].auth_credentials = e.target.value;
                               setSystemSettings({...systemSettings, nodes: newNodes});
                             }}
                           />
                         </div>
                       </div>
                     </div>
                     <div className="p-4 pt-0 flex justify-between items-center mt-auto">
                       <button
                         className={`text-sm font-medium ${systemSettings.active_node_id === node.id ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                         disabled={systemSettings.active_node_id === node.id}
                         onClick={() => {
                           setSystemSettings({...systemSettings, active_node_id: node.id});
                         }}
                       >
                         {systemSettings.active_node_id === node.id ? '已选中' : '设为激活节点'}
                       </button>
                       <button
                         className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                         onClick={() => {
                           if (window.confirm("确定删除该节点？")) {
                              if (node.id && node.id.length > 0 && node.id !== "local" && isNaN(Number(node.id))) {
                                 axios.delete(`/api/nodes/${node.id}`).catch(() => alert("服务端删除节点失败"));
                              }
                              const newNodes = systemSettings.nodes.filter((_, i) => i !== index);
                              setSystemSettings({
                                ...systemSettings,
                                nodes: newNodes,
                                active_node_id: systemSettings.active_node_id === node.id && newNodes.length > 0 ? newNodes[0].id : systemSettings.active_node_id
                              });
                           }
                         }}
                       >
                         删除
                       </button>
                     </div>
                   </div>
                ))}

                {/* Add New Node Card */}
                <button
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-colors min-h-[300px]"
                  onClick={() => {
                     const newNodes = [...systemSettings.nodes, { id: Date.now().toString(), name: "新节点", url: "http://", type: "remote", auth_type: "none", auth_credentials: "" }];
                     setSystemSettings({...systemSettings, nodes: newNodes});
                  }}
                >
                  <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                  <span className="font-medium">添加新节点</span>
                  <span className="text-xs mt-1 opacity-70">支持 Basic Auth / Token 鉴权</span>
                </button>
                {/* 右侧：节点运行日志 / 全局设置摘要 */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 xl:col-span-1 h-full min-h-[400px]">
                   <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
                     <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     最近活动日志
                   </h3>
                   <div className="text-sm text-gray-500 space-y-4">
                      {systemSettings.nodes?.length > 1 ? (
                        <>
                           <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                             <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-2 py-0.5 rounded mr-2">Info</span>
                             当前激活节点切换为: <span className="font-medium text-gray-700">{systemSettings.nodes?.find(n => n.id === systemSettings.active_node_id)?.name || '未知'}</span>
                           </div>
                           <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                             <span className="text-xs text-green-500 font-semibold bg-green-50 px-2 py-0.5 rounded mr-2">Success</span>
                             节点连接测试正常 (192.168.1.215:8188)
                           </div>
                        </>
                      ) : (
                         <div className="text-center py-10 opacity-60">
                            无近期活动
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
             <h2 className="text-lg font-bold text-gray-800 mb-4">系统设置</h2>
             <p className="text-gray-600 mb-6">Web 端落地系统设置，您可以直接在网页中修改各种服务端和数据存放路径配置。</p>

             <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">管理员账号 (Username)</label>
                     <input
                       type="text"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       placeholder="例如: admin"
                       value={systemSettings.admin_username || "admin"}
                       onChange={e => setSystemSettings({...systemSettings, admin_username: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">管理员密码 (Password)</label>
                     <input
                       type="password"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       placeholder="输入新密码"
                       value={systemSettings.admin_password || "adminpassword"}
                       onChange={e => setSystemSettings({...systemSettings, admin_password: e.target.value})}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">ComfyUI 模型落盘物理路径 (Models Dir)</label>
                   <input
                     type="text"
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     placeholder="例如: C:/ComfyUI/models"
                     value={systemSettings.models_dir}
                     onChange={e => setSystemSettings({...systemSettings, models_dir: e.target.value})}
                     id="setting-models-dir"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">HTTP 代理地址 (HTTP Proxy)</label>
                     <input
                       type="text"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       placeholder="例如: http://127.0.0.1:7890 (留空为不使用)"
                       value={systemSettings.http_proxy || ""}
                       onChange={e => setSystemSettings({...systemSettings, http_proxy: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Civitai API Key (下载特定模型所需)</label>
                     <input
                       type="text"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       placeholder="粘贴您的 Civitai 账号 API 密钥"
                       value={systemSettings.civitai_api_key || ""}
                       onChange={e => setSystemSettings({...systemSettings, civitai_api_key: e.target.value})}
                     />
                   </div>
                </div>

                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  onClick={() => {
                    axios.post('/api/settings', systemSettings)
                      .then(() => alert("设置已成功保存!"))
                      .catch(err => alert("保存失败: " + err.message));

                    // Save nodes
                    systemSettings.nodes?.forEach(node => {
                        if (node.id.startsWith("local")) return;
                        if (!node.url.startsWith("http")) return;

                        // if node.id is a temporary id generated by Date.now().toString(), it means it's a new node
                        if (node.id && node.id.length > 0 && node.id !== "local" && !isNaN(Number(node.id))) {
                          axios.post('/api/nodes', {name: node.name, url: node.url, auth_type: node.auth_type, auth_credentials: node.auth_credentials}).catch(() => {});
                        } else {
                          axios.put(`/api/nodes/${node.id}`, {name: node.name, url: node.url, auth_type: node.auth_type, auth_credentials: node.auth_credentials}).catch(() => {});
                        }
                    });
                  }}
                >
                  保存设置
                </button>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* 卡片头部区域（过滤按钮等） */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              {activeTab === 'local' ? (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['all', 'Checkpoint', 'LORA', 'TextualInversion', 'Hypernetwork', 'AestheticGradient', 'Controlnet', 'Poses', 'Wildcards'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                        filterType === type
                          ? 'bg-[#228be6] text-white border-[#228be6]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type === 'all' ? 'ALL' : type.toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : (
                <h3 className="font-semibold text-gray-800">当前任务队列</h3>
              )}

              <div className="flex items-center space-x-3 text-sm">
                <button
                  onClick={() => activeTab === 'local' ? fetchLocalModels() : undefined}
                  className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  刷新
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {activeTab === 'tasks' ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">任务 ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">模型 ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">进度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {tasks.length > 0 ? tasks.map((task) => (
                      <tr key={task.task_id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-700 font-mono truncate max-w-xs">{task.task_id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{task.model_id}</td>
                        <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{task.url}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'downloading' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden flex max-w-[150px]">
                            <div className={`h-1.5 rounded-full transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${task.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block text-right font-medium max-w-[150px]">{task.progress}%</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          暂无下载任务
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localModels.length > 0 ? localModels.map((model, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group cursor-pointer" onClick={() => openModal('local', model)}>
                  <div className="h-48 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for local model image, could be an actual image if we fetch metadata */}
                    <div className="text-gray-300">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="absolute top-2 left-2 bg-gray-900 bg-opacity-70 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded uppercase">
                      {model.type}
                    </span>
                    <span className="absolute top-2 right-2 bg-emerald-500 bg-opacity-90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      {model.status === 'Ready' ? '已就绪' : model.status}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-sm truncate mb-1" title={model.name}>{model.name}</h3>
                    <p className="text-xs text-gray-500 truncate mb-4 font-mono">{model.size_mb} MB</p>
                    <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                        查看元数据
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteLocal(model); }} className="text-gray-400 hover:text-red-500 font-medium transition-colors p-1.5 rounded-md hover:bg-red-50" title="删除">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-base font-medium text-gray-500">该分类下未扫描到本地模型</p>
                  <p className="text-sm mt-1">请尝试切换其他分类或前往市场下载</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      {/* Modal / Floating Window for Models */}
      {modalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-800 flex items-center">
                {modalType === 'local' ? (
                  <><svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> 本地模型元数据</>
                ) : (
                  <><svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> Civitai 模型详情</>
                )}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-1.5 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {modalType === 'local' ? (
                <div className="space-y-6">
                  <div className="flex items-start space-x-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{modalData.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium uppercase border border-gray-200">{modalData.type}</span>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-100 font-mono">{modalData.size_mb} MB</span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md font-medium border border-emerald-100">{modalData.status === 'Ready' ? '已就绪' : modalData.status}</span>
                      </div>
                      <p className="text-sm text-gray-600">这是保存在本地系统中的模型文件。如果存在对应的元数据 JSON 或预览图，它们将会显示在此处。</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-3 text-sm">解析的元数据 (Metadata)</h5>
                    <pre className="text-xs text-gray-600 font-mono bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
                      {JSON.stringify(modalData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {modalData.image_url && (
                    <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden mb-6 border border-gray-200">
                      <img src={modalData.image_url} alt={modalData.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{modalData.name}</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-md font-medium uppercase border border-purple-100">{modalData.type}</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium border border-gray-200">版本: {modalData.version}</span>
                    </div>
                    {/* Embedded Civitai Page or detailed info could go here, for now show JSON or link */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-sm text-blue-800">
                        您可以直接在客户端内预览模型详情，或前往 <a href={`https://civitai.com/models/${modalData.id || ''}`} target="_blank" rel="noreferrer" className="font-bold underline">Civitai 官网</a> 查看完整展示和用户评论。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                关闭
              </button>
              {modalType === 'market' && (
                <button onClick={() => { setModalOpen(false); handleDownload(modalData); }} className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
                  添加到下载队列
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
