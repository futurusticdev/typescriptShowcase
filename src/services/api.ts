import axios, { AxiosError } from "axios";
import {
  Task,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RefreshResponse,
} from "../types/interfaces";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config!;
    
    // If error is not 400/401 or request was for refresh token, reject
    if (
      error.response?.status !== 400 &&
      error.response?.status !== 401 ||
      originalRequest.url === "/api/refresh"
    ) {
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post<RefreshResponse>(
          `${API_URL}/api/refresh`,
          { refreshToken }
        );

        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        processQueue(null, token);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens on refresh failure
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Add failed request to queue
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axios(originalRequest));
        },
        reject: (err: any) => {
          reject(err);
        },
      });
    });
  }
);

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/api/login", credentials);
  const { token, refreshToken } = response.data;
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { confirmPassword, ...registerPayload } = credentials;
  const response = await axiosInstance.post<AuthResponse>("/api/register", registerPayload);
  const { token, refreshToken } = response.data;
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get<Task[]>("/api/tasks");
  return response.data;
};

export const createTask = async (
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> => {
  const response = await axiosInstance.post<Task>("/api/tasks", {
    ...task,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const updateTask = async (
  taskId: string,
  task: Partial<Task>
): Promise<Task> => {
  const response = await axiosInstance.put<Task>(`/api/tasks/${taskId}`, {
    ...task,
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
  return response.data;
};
