import { useStore } from "../../store";

export default function TasksPanel() {
  const { tasks } = useStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col min-h-[500px]">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">当前任务队列</h3>
      </div>
      <div className="flex-1 overflow-auto">
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
          {tasks.length > 0 ? tasks.map((t) => (
            <tr key={t.task_id} className="hover:bg-blue-50/50 transition-colors">
              <td className="px-6 py-4 text-gray-700 font-mono truncate max-w-xs">{t.task_id.substring(0, 8)}...</td>
              <td className="px-6 py-4 font-medium text-gray-900">{t.model_id}</td>
              <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{t.url}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  t.status === 'completed' ? 'bg-green-100 text-green-700' :
                  t.status === 'downloading' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {t.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden flex max-w-[150px]">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${t.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${t.progress}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 mt-1 block text-right font-medium max-w-[150px]">{Math.round(t.progress)}%</span>
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
      </div>
    </div>
  );
}

