import { useState, useEffect } from "react";
import axios from "axios";
import ModelDetailModal from "./ModelDetailModal";

export default function LocalModelsPanel() {
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const fetchLocalModels = () => {
    setLoading(true);
    axios.get(`/api/local_models?type=${filterType}`).then((res) => {
      setLocalModels(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLocalModels();
  }, [filterType]);

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

  const handleSyncCivitai = async (model: any) => {
    try {
      setLoading(true);
      await axios.post(`/api/local_models/${model.type}/${model.name}/sync`);
      alert("同步C站元数据成功！");
      fetchLocalModels();
    } catch (err: any) {
      alert("同步失败: " + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const openModal = (data: any) => {
    setModalData(data);
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex flex-col flex-1">
          <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-1">
            {['all', 'checkpoints', 'loras', 'vae', 'controlnet'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
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
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start text-sm text-blue-800">
            <svg className="w-5 h-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>请注意：您在此处删除本地模型时，不仅会删除主体文件，还会一并清除与之绑定的缩略图和描述 JSON 文件。</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm ml-4 self-start">
          <button
            onClick={fetchLocalModels}
            className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            刷新
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400 text-sm">正在扫描本地模型目录...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {localModels.map((m, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer" onClick={() => openModal(m)}>
                <div className="h-48 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={`/api/local_models/${m.type}/${m.name}/preview`}
                       onError={(e) => {
                         // 尝试加载远程图片如果本地没有
                         if (m.image_url && e.currentTarget.src !== m.image_url) {
                            e.currentTarget.src = m.image_url;
                         } else {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                         }
                       }}
                       alt={m.name}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="hidden text-gray-300 flex flex-col items-center">
                    <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs">无预览图</span>
                  </div>
                  <span className="absolute top-2 left-2 bg-gray-900 bg-opacity-70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                    {m.type}
                  </span>
                  <span className="absolute top-2 right-2 bg-emerald-500 bg-opacity-90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    {m.status === 'Ready' ? '已就绪' : m.status}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={m.name}>{m.name}</h3>
                  <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[11px]">{m.size_mb} MB</span>
                    {m.metadata?.version && (
                      <span className="flex items-center text-gray-500">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        {m.metadata.version}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); handleSyncCivitai(m); }} className="flex-1 py-2.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 text-blue-700 rounded-lg text-[13px] font-bold transition-all shadow-sm flex items-center justify-center" title="匹配C站元数据">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      同步
                    </button>
                    <button className="flex-1 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 rounded-lg text-[13px] font-bold transition-all shadow-sm">
                      详情
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteLocal(m); }} className="w-10 flex items-center justify-center bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="删除">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {localModels.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p className="text-base font-medium text-gray-500">该分类下未扫描到本地模型</p>
                <p className="text-sm mt-1">请尝试切换其他分类或前往市场下载</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ModelDetailModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        modalData={modalData}
        modalType="local"
      />
    </div>
  );
}
