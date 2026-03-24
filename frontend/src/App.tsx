import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./public/HomePage";
import AdminDashboard from "./admin/AdminDashboard";
import LoginPage from "./admin/LoginPage";
import SetupPage from "./admin/SetupPage";
import { useEffect, useState } from "react";
import { connectWebSocket, useStore } from "./store";
import axios from "axios";

// 配置全局 Axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useStore((state) => state.token);
  const [initialized, setInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    axios.get("/api/setup/status").then(res => {
      setInitialized(res.data.initialized);
    }).catch(() => setInitialized(false));
  }, []);

  if (initialized === null) return <div className="p-10 text-center">Loading...</div>;
  if (!initialized) return <Navigate to="/setup" replace />;

  if (!token) {
    return <LoginPage />;
  }
  return children;
}

function App() {
  useEffect(() => {
    connectWebSocket();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
