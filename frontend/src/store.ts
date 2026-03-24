import { create } from 'zustand'

interface DownloadTask {
  task_id: string
  model_id: string
  status: string
  progress: number
  url: string
}

interface StoreState {
  tasks: DownloadTask[]
  token: string | null
  user: any | null
  setTasks: (tasks: DownloadTask[]) => void
  setToken: (token: string | null) => void
  setUser: (user: any) => void
  logout: () => void
}

export const useStore = create<StoreState>((set) => ({
  tasks: [],
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  setTasks: (tasks) => set({ tasks }),
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
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    set({ token: null, user: null })
  }
}))

// WebSocket 连接单例
let ws: WebSocket | null = null;
export const connectWebSocket = () => {
    if (ws) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the explicit port if running dev, otherwise assume current host (production)
    const host = window.location.port === '5173' ? 'localhost:8000' : window.location.host;
    ws = new WebSocket(`${protocol}//${host}/ws/tasks`);
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
};
