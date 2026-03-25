import { create } from 'zustand'

interface DownloadTask {
  task_id: string
  model_id: string
  status: string
  progress: number
  url: string
}

export interface DrawTask {
  task_id: string
  id?: string
  node_id?: string
  node_name?: string
  node_url?: string
  workflow_id?: string
  workflow_name?: string
  prompt?: string
  result_image_url?: string
  error_reason?: string
  started_at?: string
  finished_at?: string
  time_taken_ms?: number
  url: string
  status: string
  progress: number
}

interface StoreState {
  tasks: DownloadTask[]
  drawTasks: DrawTask[]
  token: string | null
  user: any | null
  systemSettings: any
  workflowJson: string
  setTasks: (tasks: DownloadTask[]) => void
  setDrawTasks: (tasks: DrawTask[]) => void
  setToken: (token: string | null) => void
  setUser: (user: any) => void
  setSystemSettings: (settings: any | ((prev: any) => any)) => void
  setWorkflowJson: (json: string) => void
  logout: () => void
}

export const useStore = create<StoreState>((set) => ({
  tasks: [],
  drawTasks: [],
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  systemSettings: {
    models_dir: "",
    nodes: [{ id: "local", name: "本地主节点", url: "http://127.0.0.1:8188", type: "local", auth_type: "none", auth_credentials: "" }],
    active_node_id: "local",
    admin_username: "admin",
    admin_password: "adminpassword",
    civitai_api_key: "",
    http_proxy: ""
  },
  workflowJson: "{\n  // 在这里粘贴 ComfyUI 导出的 API 格式工作流 JSON\n}",
  setTasks: (tasks) => set({ tasks }),
  setDrawTasks: (drawTasks) => set({ drawTasks }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
    set({ token })
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
    set({ user })
  },
  setSystemSettings: (settings) => set((state) => ({
    systemSettings: typeof settings === 'function' ? settings(state.systemSettings) : settings
  })),
  setWorkflowJson: (workflowJson) => set({ workflowJson }),
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    set({ token: null, user: null })
  }
}))

// WebSocket 连接单例
let ws: WebSocket | null = null;
let wsDraws: WebSocket | null = null;

export const connectWebSocket = () => {
    if (ws) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173' ? 'localhost:8000' : window.location.host;
    ws = new WebSocket(`${protocol}//${host}/api/ws/tasks`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
            useStore.getState().setTasks(data.data);
        }
    };
    ws.onclose = () => {
        ws = null;
        setTimeout(connectWebSocket, 3000);
    };

    if (wsDraws) return;
    wsDraws = new WebSocket(`${protocol}//${host}/ws/draws`);
    wsDraws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'draw_progress') {
            useStore.getState().setDrawTasks(data.data);
        }
    };
    wsDraws.onclose = () => {
        wsDraws = null;
        setTimeout(connectWebSocket, 3000);
    };
};
