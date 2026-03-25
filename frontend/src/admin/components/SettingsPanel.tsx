import axios from "axios";
import { useStore } from "../../store";

export default function SettingsPanel() {
  const { systemSettings, setSystemSettings } = useStore();

  const handleSave = () => {
    axios.post('/api/settings', systemSettings)
      .then(() => alert("设置保存成功!"))
      .catch(err => alert("保存失败: " + err.message));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">系统设置</h2>
          <p className="text-gray-600 mt-1 text-sm">Web 端落地系统设置，您可以直接在网页中修改各种服务端和数据存放路径配置。</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">管理员账号 (Username)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="例如: admin"
              value={systemSettings.admin_username || "admin"}
              onChange={e => setSystemSettings({...systemSettings, admin_username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">管理员密码 (Password)</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="输入新密码"
              value={systemSettings.admin_password || "adminpassword"}
              onChange={e => setSystemSettings({...systemSettings, admin_password: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ComfyUI 模型挂载根目录</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="例如: /path/to/ComfyUI/models"
            value={systemSettings.models_dir || ""}
            onChange={e => setSystemSettings({...systemSettings, models_dir: e.target.value})}
          />
          <p className="text-xs text-gray-500 mt-1">设置后，下载的模型将自动分类保存到该目录下的对应文件夹 (如 checkpoints, loras 等)。</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Civitai API Key</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="可选: 下载受限制模型时需要"
            value={systemSettings.civitai_api_key || ""}
            onChange={e => setSystemSettings({...systemSettings, civitai_api_key: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HTTP 代理 (代理下载)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="例如: http://127.0.0.1:7890"
            value={systemSettings.http_proxy || ""}
            onChange={e => setSystemSettings({...systemSettings, http_proxy: e.target.value})}
          />
          <p className="text-xs text-gray-500 mt-1">留空则不使用代理。适用于服务器无法直接访问 Civitai 的情况。</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最大并发下载数</label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="默认: 2"
            value={systemSettings.max_concurrent_downloads || 2}
            onChange={e => setSystemSettings({...systemSettings, max_concurrent_downloads: Number(e.target.value) || 2})}
          />
          <p className="text-xs text-gray-500 mt-1">控制同时进行下载的模型任务数量，超出的任务将处于“排队中”状态等待执行。</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            保存系统设置
          </button>
        </div>
      </div>
    </div>
  );
}

