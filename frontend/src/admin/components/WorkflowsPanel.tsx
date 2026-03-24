import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "../../store";

export default function WorkflowsPanel({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const { setWorkflowJson } = useStore();

  useEffect(() => {
    axios.get("/api/workflows").then(res => setWorkflows(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">工作流模板管理</h2>
          <p className="text-gray-600 mt-1 text-sm">内建用于保存和管理常用工作流。这里提供保存、编辑、删除以及调用的功能。</p>
        </div>
        <button
          onClick={() => {
            const name = prompt("请输入工作流名称:");
            if (name) {
              axios.post('/api/workflows', { name, description: "", json_data: "{}" })
                .then(res => setWorkflows([...workflows, res.data]))
                .catch(err => alert("创建失败: " + err.message));
            }
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          新建模板
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
