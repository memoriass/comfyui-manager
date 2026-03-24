import { useStore } from "../../store";

export default function DrawLogsPanel() {
  const { drawTasks } = useStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
       <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
         <div>
           <h2 className="text-lg font-bold text-gray-800">生图日志</h2>
           <p className="text-gray-600 mt-1 text-sm">记录了当前系统中所有发往后端的绘图任务的历史及详情。</p>
         </div>
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
               {drawTasks.length > 0 ? drawTasks.map((task) => (
                 <tr key={task.task_id} className="hover:bg-blue-50/50 transition-colors">
                   <td className="px-6 py-4 text-gray-700">-</td>
                   <td className="px-6 py-4 text-gray-700">-</td>
                   <td className="px-6 py-4 text-gray-700">{task.url}</td>
                   <td className="px-6 py-4 text-gray-700">-</td>
                   <td className="px-6 py-4 font-mono text-gray-900">{task.task_id}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                     }`}>
                       {task.status}
                     </span>
                   </td>
                   <td className="px-6 py-4">
                     <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden flex max-w-[150px]">
                       <div className={`h-1.5 rounded-full transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${task.progress}%` }}></div>
                     </div>
                     <span className="text-xs text-gray-500 mt-1 block text-right font-medium max-w-[150px]">{Math.round(task.progress)}%</span>
                   </td>
                   <td className="px-6 py-4 text-gray-700">-</td>
                   <td className="px-6 py-4 text-gray-700">-</td>
                   <td className="px-6 py-4 text-red-500">-</td>
                 </tr>
               )) : (
                <tr>
                   <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      搜索无结果
                   </td>
                </tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
