import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "../../store";

interface ParsedParams {
  positiveNodeId: string;
  positiveText: string;
  negativeNodeId: string;
  negativeText: string;
  latentNodeId: string;
  width: number;
  height: number;
  batchSize: number;
  samplerNodeId: string;
  seed: number;
  steps: number;
  cfg: number;
  samplerName: string;
  scheduler: string;
  ckptNodeId: string;
  ckptName: string;
}

export default function PlaygroundPanel() {
  const { systemSettings, setSystemSettings, workflowJson, setWorkflowJson } = useStore();
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("// 点击上方按钮发送测试请求\n// 响应结果将显示在这里");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [parsedParams, setParsedParams] = useState<ParsedParams | null>(null);
  const [viewMode, setViewMode] = useState<'form' | 'json'>('json');

  useEffect(() => {
    axios.get("/api/workflows").then(res => setWorkflows(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const data = JSON.parse(workflowJson);
      let samplerNodeId = null;
      let samplerData: any = null;
      for (const [id, node] of Object.entries(data)) {
        if ((node as any).class_type === "KSampler" || (node as any).class_type === "KSamplerAdvanced") {
          samplerNodeId = id;
          samplerData = node;
          break;
        }
      }
      if (samplerNodeId && samplerData) {
        const positiveLinkId = samplerData.inputs.positive?.[0];
        const negativeLinkId = samplerData.inputs.negative?.[0];
        const latentLinkId = samplerData.inputs.latent_image?.[0];
        const modelLinkId = samplerData.inputs.model?.[0];

        let positiveText = "", negativeText = "", width = 512, height = 512, batchSize = 1, ckptName = "";

        if (positiveLinkId && data[positiveLinkId]?.class_type === "CLIPTextEncode") {
          positiveText = data[positiveLinkId].inputs.text || "";
        }
        if (negativeLinkId && data[negativeLinkId]?.class_type === "CLIPTextEncode") {
          negativeText = data[negativeLinkId].inputs.text || "";
        }
        if (latentLinkId && data[latentLinkId]?.class_type === "EmptyLatentImage") {
          width = data[latentLinkId].inputs.width || 512;
          height = data[latentLinkId].inputs.height || 512;
          batchSize = data[latentLinkId].inputs.batch_size || 1;
        }
        if (modelLinkId && data[modelLinkId]?.class_type === "CheckpointLoaderSimple") {
          ckptName = data[modelLinkId].inputs.ckpt_name || "";
        }

        setParsedParams({
          samplerNodeId, positiveNodeId: positiveLinkId, positiveText, negativeNodeId: negativeLinkId, negativeText,
          latentNodeId: latentLinkId, width, height, batchSize,
          seed: samplerData.inputs.seed, steps: samplerData.inputs.steps, cfg: samplerData.inputs.cfg,
          samplerName: samplerData.inputs.sampler_name, scheduler: samplerData.inputs.scheduler,
          ckptNodeId: modelLinkId, ckptName
        });
        if (viewMode === 'json') setViewMode('form');
        return;
      }
    } catch(e) {}
    setParsedParams(null);
    setViewMode('json');
  }, [workflowJson]);

  const handleUpdateParam = (key: keyof ParsedParams, value: any) => {
    if (!parsedParams) return;
    setParsedParams({ ...parsedParams, [key]: value });
  };

  const handleGenerate = async () => {
    try {
      let finalJson = JSON.parse(workflowJson);
      if (viewMode === 'form' && parsedParams) {
        if (parsedParams.positiveNodeId && finalJson[parsedParams.positiveNodeId]) {
          finalJson[parsedParams.positiveNodeId].inputs.text = parsedParams.positiveText;
        }
        if (parsedParams.negativeNodeId && finalJson[parsedParams.negativeNodeId]) {
          finalJson[parsedParams.negativeNodeId].inputs.text = parsedParams.negativeText;
        }
        if (parsedParams.latentNodeId && finalJson[parsedParams.latentNodeId]) {
          finalJson[parsedParams.latentNodeId].inputs.width = parsedParams.width;
          finalJson[parsedParams.latentNodeId].inputs.height = parsedParams.height;
          finalJson[parsedParams.latentNodeId].inputs.batch_size = parsedParams.batchSize;
        }
        if (parsedParams.samplerNodeId && finalJson[parsedParams.samplerNodeId]) {
          finalJson[parsedParams.samplerNodeId].inputs.seed = parsedParams.seed;
          finalJson[parsedParams.samplerNodeId].inputs.steps = parsedParams.steps;
          finalJson[parsedParams.samplerNodeId].inputs.cfg = parsedParams.cfg;
        }
      }

      const targetUrl = `/api/generate?node_id=${systemSettings.active_node_id}${selectedWorkflowId ? `&workflow_id=${selectedWorkflowId}` : ''}`;
      setPlaygroundResponse(`// 发送 POST ${targetUrl} ...\n`);
      const res = await axios.post(targetUrl, finalJson);
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
        <div className="flex-[2] flex flex-col space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex space-x-2 items-center">
               <h3 className="font-bold text-gray-700">配置区域</h3>
               {parsedParams && (
                 <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button className={`px-3 py-1 text-xs font-medium rounded ${viewMode === 'form' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setViewMode('form')}>表单视图</button>
                    <button className={`px-3 py-1 text-xs font-medium rounded ${viewMode === 'json' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setViewMode('json')}>JSON 源码</button>
                 </div>
               )}
             </div>
             <div className="flex space-x-2">
               <select
                 className="text-sm border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                 value={selectedWorkflowId}
                 onChange={(e) => {
                   setSelectedWorkflowId(e.target.value);
                   const wf = workflows.find(w => w.id === e.target.value);
                   if (wf) setWorkflowJson(wf.json_data);
                 }}
               >
                 <option value="">-- 加载工作流预设 --</option>
                 {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
               </select>
               <button
                 onClick={handleGenerate}
                 className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center text-sm">
                 <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 发送生图
               </button>
             </div>
          </div>

          <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
             {viewMode === 'json' ? (
               <textarea
                 className="flex-1 w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm min-h-[400px]"
                 value={workflowJson}
                 onChange={(e) => setWorkflowJson(e.target.value)}
                 placeholder="请在 ComfyUI 中点击 Save (API Format)，并将导出的 JSON 内容粘贴到此处"
               ></textarea>
             ) : (
               <div className="flex-1 overflow-auto bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-4">
                 {parsedParams && (
                   <>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">模型 (Model)</label>
                         <input type="text" readOnly className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-100 text-gray-600" value={parsedParams.ckptName} />
                       </div>
                       <div className="flex space-x-2">
                         <div className="flex-1">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">宽 (Width)</label>
                           <input type="number" className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={parsedParams.width} onChange={(e) => handleUpdateParam('width', Number(e.target.value))} />
                         </div>
                         <div className="flex-1">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">高 (Height)</label>
                           <input type="number" className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={parsedParams.height} onChange={(e) => handleUpdateParam('height', Number(e.target.value))} />
                         </div>
                         <div className="w-20">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">批次 (Batch)</label>
                           <input type="number" className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={parsedParams.batchSize} onChange={(e) => handleUpdateParam('batchSize', Number(e.target.value))} />
                         </div>
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-gray-500 mb-1">正向提示词 (Positive Prompt)</label>
                       <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-20" value={parsedParams.positiveText} onChange={(e) => handleUpdateParam('positiveText', e.target.value)}></textarea>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-gray-500 mb-1">反向提示词 (Negative Prompt)</label>
                       <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-20" value={parsedParams.negativeText} onChange={(e) => handleUpdateParam('negativeText', e.target.value)}></textarea>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <div className="flex justify-between mb-1">
                           <label className="text-xs font-semibold text-gray-500">步数 (Steps)</label>
                           <span className="text-xs text-gray-700">{parsedParams.steps}</span>
                         </div>
                         <input type="range" min="1" max="150" className="w-full" value={parsedParams.steps} onChange={(e) => handleUpdateParam('steps', Number(e.target.value))} />
                       </div>
                       <div>
                         <div className="flex justify-between mb-1">
                           <label className="text-xs font-semibold text-gray-500">提示词相关性 (CFG Scale)</label>
                           <span className="text-xs text-gray-700">{parsedParams.cfg}</span>
                         </div>
                         <input type="range" min="1" max="30" step="0.5" className="w-full" value={parsedParams.cfg} onChange={(e) => handleUpdateParam('cfg', Number(e.target.value))} />
                       </div>
                       <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">随机种子 (Seed)</label>
                         <div className="flex space-x-2">
                           <input type="number" className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={parsedParams.seed} onChange={(e) => handleUpdateParam('seed', Number(e.target.value))} />
                           <button onClick={() => handleUpdateParam('seed', Math.floor(Math.random() * 1e14))} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium transition-colors">随机</button>
                         </div>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             )}
          </div>
        </div>
        <div className="flex-1 bg-gray-900 rounded-lg p-5 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap max-h-[700px] shadow-inner">
          <pre className="leading-relaxed">{playgroundResponse}</pre>
        </div>
      </div>
    </div>
  );
}
