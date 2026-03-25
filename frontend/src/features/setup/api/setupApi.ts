import { axios } from "../../shared/api/http";

export interface SetupStatus {
  status: string;
  initialized: boolean;
  local_ip: string;
  default_port: number;
}

export interface SetupInitPayload {
  admin_username: string;
  admin_password: string;
  host: string;
  port: number;
}

export async function fetchSetupStatus() {
  const response = await axios.get<SetupStatus>("/api/setup/status");
  return response.data;
}

export async function initializeSetup(payload: SetupInitPayload) {
  const response = await axios.post("/api/setup/init", payload);
  return response.data;
}

