import { axios } from "../../shared/api/http";
import type { NodeItem, SystemSettings } from "../../entities/system/types";

export async function fetchSystemSettings() {
  const response = await axios.get<SystemSettings>("/api/settings");
  return response.data;
}

export async function fetchNodes() {
  const response = await axios.get<NodeItem[]>("/api/nodes");
  return response.data;
}

