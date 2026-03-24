import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [filterType, setFilterType] = useState("all");

  const fetchModels = (type: string) => {
    let url = `/api/local_models?type=${type}`;
    axios.get(url).then((res) => {
      setModels(res.data.data);
    });
  }

  useEffect(() => {
    // 获取本地模型列表 (包含元数据)
    fetchModels(filterType);
  }, [filterType]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex overflow-hidden">
      {/* 侧栏 - 如果选中了模型 */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 transition-opacity">
          <div className="w-full max-w-md bg-gray-800 h-full shadow-2xl overflow-y-auto transform transition-transform translate-x-0">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
              <h2 className="text-xl font-bold">{selectedModel.name}</h2>
              <button onClick={() => setSelectedModel(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {selectedModel.image_url && (
              <img src={selectedModel.image_url} alt="preview" className="w-full object-cover" />
            )}
            <div className="p-6">
              <div className="flex space-x-2 mb-4">
                <span className="bg-blue-600 px-2 py-1 text-xs rounded">{selectedModel.type}</span>
                <span className="bg-gray-700 px-2 py-1 text-xs rounded">{selectedModel.size_mb} MB</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">模型介绍</h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                 {selectedModel.description || "暂无描述信息。这个模型是从 C站或本地导入的，并未包含相关的元数据说明。"}
              </p>

              <h3 className="text-lg font-semibold mb-2">本地路径</h3>
              <code className="block bg-gray-900 p-2 rounded text-xs text-green-400 font-mono break-all">
                models/{selectedModel.type}/{selectedModel.name}
              </code>

              <button className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded font-bold transition">
                在 ComfyUI 中使用该节点
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主展示区 */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#10151B]">
        <header className="px-6 py-4 flex flex-col border-b border-gray-800 sticky top-0 z-10 bg-[#10151B]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Models
            </h1>
            <a href="/admin" className="text-sm bg-[#1A1C23] border border-gray-700 px-4 py-2 rounded-lg hover:bg-[#252830] font-medium transition text-white">
              进入管理后台
            </a>
          </div>

          {/* 分类栏 - 对齐 Civitai 样式 */}
          <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
            {['all', 'checkpoints', 'loras', 'vae', 'controlnet'].map((type) => (
              <button
                key={type}
                onClick={() => {
                    setFilterType(type);
                    setModels([]); // clear to show loading
                }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                  filterType === type
                    ? 'bg-[#228be6] text-white border-[#228be6]'
                    : 'bg-[#25262B] text-gray-300 border-[#373A40] hover:bg-[#2C2E33]'
                }`}
              >
                {type === 'all' ? 'ALL' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <div className="p-6">
          {models.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl mb-4">当前没有扫描到任何本地模型</p>
              <p>请进入管理员后台，从模型市场下载。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {models.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedModel(m)}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-900 flex items-center justify-center">
                    {m.image_url ? (
                      <img src={m.image_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <span className="text-gray-600 text-5xl font-bold">?</span>
                    )}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 px-2 py-1 text-xs rounded text-gray-200 backdrop-blur-sm">
                      {m.type}
                    </div>
                  </div>
                  <div className="p-3">
                    <h2 className="text-sm font-bold truncate mb-1">{m.metadata?.name || m.name}</h2>
                    <p className="text-xs text-gray-400 mb-2 truncate">
                      {m.description.substring(0, 50)}...
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500 font-mono">
                      <span className="text-[#228be6] bg-[#228be6]/10 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-[#228be6]/20">
                        {m.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
