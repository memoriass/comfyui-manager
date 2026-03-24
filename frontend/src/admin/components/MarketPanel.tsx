import { useState, useEffect } from "react";
import axios from "axios";
import ModelDetailModal from "./ModelDetailModal";

export default function MarketPanel() {
  const [marketModels, setMarketModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const fetchMarketModels = (q = "", typeOverride?: string) => {
    setLoading(true);
    const t = typeOverride || filterType;
    axios.get(`/api/market?q=${q}&type=${t}`)
      .then(res => {
        setMarketModels(res.data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMarketModels([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMarketModels(searchQuery);
  }, [filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketModels(searchQuery);
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

  const openModal = (data: any) => {
    setModalData(data);
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-gray-100">
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

        <div className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar">
          {['all', 'checkpoints', 'loras', 'vae', 'controlnet', 'embeddings'].map((type) => (
            <button
              key={type}
              onClick={() => {
                  setFilterType(type);
                  setMarketModels([]);
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-colors border ${
                filterType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'ALL' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400 text-sm flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            正在从 Civitai 拉取数据...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketModels.map((m, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer" onClick={() => openModal(m)}>
                <div className="h-48 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs">无预览图</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-gray-900 bg-opacity-70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                    {m.type}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={m.name}>{m.name}</h3>
                  <div className="text-xs text-gray-500 mb-4 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    版本: <span className="font-medium ml-1 text-gray-700">{m.version}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(m); }}
                    className="mt-auto w-full py-2.5 bg-blue-50/50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-blue-600 rounded-lg text-[13px] font-bold transition-all shadow-sm"
                  >
                    添加到 ComfyUI
                  </button>
                </div>
              </div>
            ))}
            {marketModels.length === 0 && !loading && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-base font-medium text-gray-500">未找到匹配的模型</p>
                <p className="text-sm mt-1">请尝试更换搜索词或分类</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ModelDetailModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        modalData={modalData}
        modalType="market"
        handleDownload={handleDownload}
      />
    </div>
  );
}
