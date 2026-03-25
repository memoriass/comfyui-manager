import axios from "axios";

let initialized = false;

export function setupHttpInterceptors(onUnauthorized: () => void) {
  if (initialized) return;

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
      if (error.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  initialized = true;
}

export { axios };

