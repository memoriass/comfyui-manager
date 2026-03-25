import { axios } from "../../shared/api/http";

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const response = await axios.post("/api/login", payload);
  return response.data as { token: string; user: unknown };
}

