import { useState } from "react";
import axios from "axios";
import { useStore } from "../../store";

export default function PlaygroundPanel() {
  const { systemSettings, setSystemSettings, workflowJson, setWorkflowJson } = useStore();
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("// 点击上方按钮发送测试请求\n// 响应结果将显示在这里");

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">ComfyUI 绘图控制台</h2>
          <p className="text-gray-600 mt-1 text-sm">内建用于复刻 ComfyUI 控制台的实际绘图界面，对接本地和远程 ComfyUI 后端。您可以在此配置工作流 API JSON 格式来测试生图效果。</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <label className="text-sm font-medium text-gray-700">当前节点:</label>
          <select
            className="bg-transparent text-sm font-semibold text-blue-600 focus:outline-none cursor-pointer"
            value={systemSettings.active_node_id || "local"}
            onChange={e => setSystemSettings({...systemSettings, active_node_id: e.target.value})}
          >
            {systemSettings.nodes?.map((node: any) => (
              <option key={node.id} value={node.id}>{node.name} ({node.type})</option>
            ))}
          </select>
        </div>
      </div>
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                try {
                  const parsed = JSON.parse(workflowJson);
                  handlePlaygroundTest('/api/generate', 'POST', parsed);
                } catch (e) {
                  alert("工作流 JSON 格式错误，请检查!");
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex-1 shadow-sm transition-colors"
            >
              发送工作流 (生图)
            </button>
            <button
              onClick={() => {
                const promptId = prompt("请输入想要查询状态的 prompt_id:");
                if (promptId) handlePlaygroundTest(`/api/generate/status/${promptId}`);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex-1 shadow-sm transition-colors"
            >
              查询生图状态
            </button>
            <button
              onClick={() => handlePlaygroundTest('/api/models?limit=5')}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex-1 shadow-sm transition-colors"
            >
              获取可用模型
            </button>
          </div>
          <div className="flex-1 bg-gray-900 rounded-lg p-5 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap max-h-[500px] shadow-inner">
            <pre className="leading-relaxed">{playgroundResponse}</pre>
          </div>
        </div>
       </div>
    </div>
  );
}
