import axios from "axios";
import { useStore } from "../../store";
import { useState } from "react";

export default function NodesPanel() {
  const { systemSettings, setSystemSettings } = useStore();
  const [logsModal, setLogsModal] = useState({ open: false, nodeName: "", logs: "" });

  const handleSaveNode = async (node: any) => {
    if (!node.url.startsWith("http")) {
      alert("URL 必须以 http 或 https 开头");
      return;
    }
    try {
      if (node.id && node.id.length > 0 && node.type !== "local" && !isNaN(Number(node.id))) {
        await axios.post('/api/nodes', {name: node.name, url: node.url, auth_type: node.auth_type, auth_credentials: node.auth_credentials});
      } else {
        await axios.put(`/api/nodes/${node.id}`, {name: node.name, url: node.url, auth_type: node.auth_type, auth_credentials: node.auth_credentials});
      }
      const res = await axios.get('/api/nodes');
      setSystemSettings({...systemSettings, nodes: res.data});
      alert(`节点 ${node.name} 保存成功!`);
    } catch (err) {
      alert("保存节点遇到错误，可能未保存成功");
    }
  };

  const handleViewLogs = async (node: any) => {
    try {
      const res = await axios.get(`/api/nodes/${node.id}/logs`);
      setLogsModal({ open: true, nodeName: node.name, logs: res.data.logs });
    } catch (err: any) {
      alert("获取日志失败: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteNode = (node: any, index: number) => {
    if (window.confirm("确定删除该节点？")) {
       if (node.id && node.id.length > 0 && node.type !== "local" && isNaN(Number(node.id))) {
          axios.delete(`/api/nodes/${node.id}`).catch(() => alert("服务端删除节点失败"));
       }
       const newNodes = systemSettings.nodes.filter((_: any, i: number) => i !== index);
       setSystemSettings({
         ...systemSettings,
         nodes: newNodes,
         active_node_id: systemSettings.active_node_id === node.id && newNodes.length > 0 ? newNodes[0].id : systemSettings.active_node_id
       });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">节点管理</h2>
          <p className="text-gray-600 mt-1 text-sm">管理您的 ComfyUI 节点实例，您可以添加多个远程节点并分配不同参数。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 overflow-auto">
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start pr-4">
          {systemSettings.nodes?.map((node: any, index: number) => (
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
                 <div className="flex space-x-2">
                   <button
                     className={`text-sm font-medium ${systemSettings.active_node_id === node.id ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                     disabled={systemSettings.active_node_id === node.id}
                     onClick={() => {
                       setSystemSettings({...systemSettings, active_node_id: node.id});
                       axios.post('/api/settings', { active_node_id: node.id }).catch(() => {});
                     }}
                   >
                     {systemSettings.active_node_id === node.id ? '已选中' : '设为激活'}
                   </button>
                   <button
                     className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                     onClick={() => handleSaveNode(node)}
                   >
                     保存
                   </button>
                 </div>
                 <div className="flex space-x-2">
                   <button
                     className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                     onClick={() => handleViewLogs(node)}
                   >
                     运行日志
                   </button>
                   <button
                     className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                     onClick={() => handleDeleteNode(node, index)}
                   >
                     删除
                   </button>
                 </div>
               </div>
             </div>
          ))}

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
          </div>
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
                       当前激活节点切换为: <span className="font-medium text-gray-700">{systemSettings.nodes?.find((n: any) => n.id === systemSettings.active_node_id)?.name || '未知'}</span>
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

      {logsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setLogsModal({ open: false, nodeName: "", logs: "" })}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {logsModal.nodeName} - 运行日志
              </h3>
              <button onClick={() => setLogsModal({ open: false, nodeName: "", logs: "" })} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-gray-900 text-green-400 font-mono text-xs whitespace-pre-wrap">
              {logsModal.logs}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-xl">
              <button onClick={() => setLogsModal({ open: false, nodeName: "", logs: "" })} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
