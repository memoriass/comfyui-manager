import { useEffect } from "react";
import { connectWebSocket } from "../../app/store/useAppStore";

export function useRealtimeTasks() {
  useEffect(() => {
    connectWebSocket();
  }, []);
}

