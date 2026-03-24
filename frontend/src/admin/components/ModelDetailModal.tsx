export default function ModelDetailModal({ 
  modalOpen, 
  setModalOpen, 
  modalData, 
  modalType, 
  handleDownload 
}: { 
  modalOpen: boolean; 
  setModalOpen: (open: boolean) => void; 
  modalData: any; 
  modalType: 'local' | 'market'; 
  handleDownload?: (model: any) => void; 
}) {
  if (!modalOpen || !modalData) return null;

  return (
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
          {modalType === 'market' && handleDownload && (
            <button onClick={() => { setModalOpen(false); handleDownload(modalData); }} className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
              下载模型到 ComfyUI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
