export interface DownloadTask {
  task_id: string;
  model_id: string;
  status: string;
  progress: number;
  url: string;
  downloaded_bytes?: number;
  total_bytes?: number;
  speed?: number;
}

export interface DrawTask {
  task_id: string;
  id?: string;
  node_id?: string;
  node_name?: string;
  node_url?: string;
  workflow_id?: string;
  workflow_name?: string;
  prompt?: string;
  result_image_url?: string;
  error_reason?: string;
  started_at?: string;
  finished_at?: string;
  time_taken_ms?: number;
  url: string;
  status: string;
  progress: number;
}

export interface NodeItem {
  id: string;
  name: string;
  url: string;
  type: string;
  auth_type?: string;
  auth_credentials?: string;
}

export interface SystemSettings {
  models_dir: string;
  nodes: NodeItem[];
  active_node_id: string;
  admin_username: string;
  admin_password: string;
  civitai_api_key: string;
  http_proxy: string;
  max_concurrent_downloads: number;
}

