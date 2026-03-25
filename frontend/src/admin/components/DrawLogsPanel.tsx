import { useState, useEffect } from "react";
import axios from "axios";
import { useStore, DrawTask } from "../../store";

export default function DrawLogsPanel() {
  const { drawTasks } = useStore();
  const [historyLogs, setHistoryLogs] = useState<DrawTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    started_from: "",
    started_to: "",
    task_id: "",
    node_id: ""
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.started_from) params.append("started_from", filters.started_from);
      if (filters.started_to) params.append("started_to", filters.started_to);
      if (filters.task_id) params.append("task_id", filters.task_id);
      if (filters.node_id) params.append("node_id", filters.node_id);

      const res = await axios.get(`/api/draw_logs?${params.toString()}`);
      setHistoryLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch draw logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleReset = () => {
    setFilters({ started_from: "", started_to: "", task_id: "", node_id: "" });
    setTimeout(fetchLogs, 0);
  };

  // Merge history with real-time tasks
  // drawTasks (WS) takes precedence for ongoing/completed sessions
  const mergedTasks = [...historyLogs];

  // Create a map to track existing task indices for fast updates
  const taskMap = new Map(mergedTasks.map((t, idx) => [t.task_id, idx]));

  for (const rtTask of drawTasks) {
    if (taskMap.has(rtTask.task_id)) {
      const idx = taskMap.get(rtTask.task_id)!;
      // Overwrite history log with real-time data
      mergedTasks[idx] = { ...mergedTasks[idx], ...rtTask };
    } else {
      // New task not yet in DB or just dispatched
      mergedTasks.unshift(rtTask);
      taskMap.set(rtTask.task_id, 0); // Index doesn't matter much for prepending, but keeps it trackable
    }
  }

  // Sort by started_at descending (approximate by ID or started_at if available)
  // For simplicity, we just keep the order (history is already sorted, unshifted ones are new)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
       <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
         <div>
           <h2 className="text-lg font-bold text-gray-800">生图日志</h2>
           <p className="text-gray-600 mt-1 text-sm">记录了当前系统中所有发往后端的绘图任务的历史及详情。</p>
         </div>
         <button onClick={fetchLogs} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors">
            刷新
         </button>
       </div>

       {/* 顶部搜索/过滤栏 */}
       <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-col space-y-1">
             <label className="text-xs font-semibold text-gray-500">开始日期</label>
             <input type="date" value={filters.started_from} onChange={(e) => setFilters(prev => ({...prev, started_from: e.target.value}))} className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex flex-col space-y-1">
             <label className="text-xs font-semibold text-gray-500">结束日期</label>
             <input type="date" value={filters.started_to} onChange={(e) => setFilters(prev => ({...prev, started_to: e.target.value}))} className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex flex-col space-y-1">
             <label className="text-xs font-semibold text-gray-500">任务 ID</label>
             <input type="text" value={filters.task_id} onChange={(e) => setFilters(prev => ({...prev, task_id: e.target.value}))} placeholder="请输入任务 ID" className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-48" />
          </div>
          <div className="flex flex-col space-y-1">
             <label className="text-xs font-semibold text-gray-500">节点 ID</label>
             <input type="text" value={filters.node_id} onChange={(e) => setFilters(prev => ({...prev, node_id: e.target.value}))} placeholder="请输入节点 ID" className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-48" />
          </div>
          <div className="flex items-end space-x-2">
             <button onClick={fetchLogs} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">查询</button>
             <button onClick={handleReset} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200">重置</button>
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
               {mergedTasks.length > 0 ? mergedTasks.map((task) => (
                 <tr key={task.task_id} className="hover:bg-blue-50/50 transition-colors">
                   <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                     {task.started_at ? new Date(task.started_at).toLocaleString() : '-'}
                   </td>
                   <td className="px-6 py-4 text-gray-700 font-mono">
                     {task.time_taken_ms ? `${(task.time_taken_ms / 1000).toFixed(2)}s` : '-'}
                   </td>
                   <td className="px-6 py-4 text-gray-700">
                     <div className="flex flex-col">
                       <span className="font-medium text-gray-900">{task.node_name || '未知节点'}</span>
                       <span className="text-xs text-gray-500">{task.url || task.node_url}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-gray-700">
                     {task.workflow_name || <span className="text-gray-400 italic">未绑定</span>}
                   </td>
                   <td className="px-6 py-4 font-mono text-xs text-gray-900 break-all w-48">
                     {task.task_id}
                   </td>
                   <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'running' || task.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                     }`}>
                       {task.status}
                     </span>
                   </td>
                   <td className="px-6 py-4">
                     <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden flex max-w-[150px]">
                       <div className={`h-1.5 rounded-full transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${task.progress || 0}%` }}></div>
                     </div>
                     <span className="text-xs text-gray-500 mt-1 block text-right font-medium max-w-[150px]">{Math.round(task.progress || 0)}%</span>
                   </td>
                   <td className="px-6 py-4 text-gray-700">
                     {task.result_image_url ? (
                       <a href={task.result_image_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">查看</a>
                     ) : '-'}
                   </td>
                   <td className="px-6 py-4 text-gray-700 w-64">
                     <div className="line-clamp-2 text-xs" title={task.prompt}>{task.prompt || '-'}</div>
                   </td>
                   <td className="px-6 py-4 text-red-500 text-xs w-48 break-all">
                     {task.error_reason || '-'}
                   </td>
                 </tr>
               )) : (
                <tr>
                   <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                      {loading ? (
                         <div className="flex flex-col items-center">
                            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            加载中...
                         </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          搜索无结果
                        </>
                      )}
                   </td>
                </tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
