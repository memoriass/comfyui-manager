import { useEffect, useState } from "react";

import { useAppStore } from "../../app/store/useAppStore";
import { fetchSetupStatus, initializeSetup, type SetupStatus } from "../../features/setup/api/setupApi";

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    admin_username: "admin",
    admin_password: "",
    host: "0.0.0.0",
    port: 8000,
  });
  const setToken = useAppStore((state) => state.setToken);

  useEffect(() => {
    fetchSetupStatus()
      .then((data) => {
        setStatus(data);
        if (data.initialized) {
          window.location.href = "/admin";
        }
        setFormData((prev) => ({ ...prev, port: data.default_port || 8000 }));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.admin_password.length < 6) {
      alert("密码长度至少6位");
      return;
    }
    setSubmitting(true);
    try {
      const data = await initializeSetup(formData);
      if (data.status === "ok") {
        setToken(data.token);
        alert("初始化成功！");
        window.location.href = "/admin";
      }
    } catch (error: any) {
      alert(`初始化失败: ${error.response?.data?.detail || error.message}`);
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
          {[
            ["管理员用户名", "admin_username", "text"],
            ["管理员密码", "admin_password", "password"],
            ["绑定 Host", "host", "text"],
          ].map(([label, key, type]) => (
            <div className="space-y-2" key={key}>
              <label className="text-sm font-medium">{label}</label>
              <input
                type={type}
                value={formData[key as keyof typeof formData] as string}
                onChange={(event) => setFormData({ ...formData, [key]: event.target.value })}
                className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
                required={key !== "host"}
                minLength={key === "admin_password" ? 6 : undefined}
              />
            </div>
          ))}
          <div className="space-y-2">
            <label className="text-sm font-medium">绑定端口</label>
            <input
              type="number"
              value={formData.port}
              onChange={(event) => setFormData({ ...formData, port: Number(event.target.value) })}
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

