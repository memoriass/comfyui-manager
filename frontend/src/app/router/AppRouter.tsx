import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminRoute from "./AdminRoute";
import AdminDashboardPage from "../../pages/admin/AdminDashboardPage";
import LoginPage from "../../pages/auth/LoginPage";
import SetupPage from "../../pages/setup/SetupPage";
import HomePage from "../../pages/public/HomePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

