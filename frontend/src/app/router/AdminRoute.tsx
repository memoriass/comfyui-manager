import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";

import { useAppStore } from "../../app/store/useAppStore";
import { fetchSetupStatus } from "../../features/setup/api/setupApi";
import LoginPage from "../../pages/auth/LoginPage";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = useAppStore((state) => state.token);
  const [initialized, setInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSetupStatus()
      .then((status) => setInitialized(status.initialized))
      .catch(() => setInitialized(false));
  }, []);

  if (initialized === null) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!initialized) {
    return <Navigate to="/setup" replace />;
  }

  if (!token) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

