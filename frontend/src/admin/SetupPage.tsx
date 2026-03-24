import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "../store";

export default function SetupPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    admin_username: "admin",
    admin_password: "",
    host: "0.0.0.0",
    port: 8000
  });

  const setToken = useStore((state) => state.setToken);

  useEffect(() => {
    axios.get("/api/setup/status").then(res => {
      setStatus(res.data);
      if (res.data.initialized) {
        window.location.href = "/admin";
      }
      setFormData(prev => ({
        ...prev,
        port: res.data.default_port || 8000
      }));
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.admin_password.length < 6) {
      alert("密码长度至少6位");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post("/api/setup/init", formData);
      if (res.data.status === "ok") {
        setToken(res.data.token);
        alert("初始化成功！");
        window.location.href = "/admin";
      }
    } catch (err: any) {
      alert("初始化失败: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">正在检查系统状态...</div>;
  if (status?.initialized) return <div className="p-10 text-center">系统已初始化，正在跳转...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border-neutral-800 rounded p-6 shadow-lg">
        <h2 className="text-xl mb-4 font-bold">系统初始化向导</h2>
        <p className="text-sm text-neutral-400 mb-6">欢迎使用 ComfyUI Manager，请配置超级管理员账号并完成初始化。</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">管理员用户名</label>
              <input
                value={formData.admin_username}
                onChange={(e: any) => setFormData({...formData, admin_username: e.target.value})}
                className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">管理员密码</label>
              <input
                type="password"
                value={formData.admin_password}
                onChange={(e: any) => setFormData({...formData, admin_password: e.target.value})}
                className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
                placeholder="至少 6 位"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">绑定 Host</label>
              <input
                value={formData.host}
                onChange={(e: any) => setFormData({...formData, host: e.target.value})}
                className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">绑定端口</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e: any) => setFormData({...formData, port: parseInt(e.target.value)})}
                className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              />
            </div>
            <button type="submit" className="w-full mt-4 p-2 bg-blue-600 rounded" disabled={submitting}>
              {submitting ? "初始化中..." : "完成初始化"}
            </button>
          </form>
      </div>
    </div>
  );
}
