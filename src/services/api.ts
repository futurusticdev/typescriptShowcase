import axios, { AxiosError } from "axios";
import {
  Task,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RefreshResponse,
} from "../types/interfaces";

/** Base API URL from environment variables, defaults to localhost */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** Development mode check */
const isDevelopment = import.meta.env.MODE === 'development';

/** Axios instance with preconfigured baseURL */
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/** Flag to track if a token refresh is in progress */
let isRefreshing = false;

/** Queue of failed requests waiting for token refresh */
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void; }[] = [];

/**
 * Process the queue of failed requests after token refresh
 * @param {any} error - Error from token refresh attempt
 * @param {string|null} token - New token if refresh successful, null if failed
 */
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

// Add authentication token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log outgoing requests in development
  if (isDevelopment) {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
  }
  return config;
});

// Update the response interceptor with better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config!;
    
    // Log error details in development
    if (isDevelopment) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: originalRequest.url,
        method: originalRequest.method
      });
    }

    // Don't attempt refresh for auth endpoints
    if (
      originalRequest.url?.includes("/api/login") ||
      originalRequest.url?.includes("/api/register") ||
      originalRequest.url === "/api/refresh"
    ) {
      return Promise.reject(error);
    }

    // Only attempt refresh for 401 (Unauthorized)
    if (error.response?.status !== 401) {
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
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens on refresh failure
        localStorage.removeItem("accessToken");
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

/**
 * Authenticates a user with their credentials
 * @param {LoginCredentials} credentials - User login credentials
 * @returns {Promise<AuthResponse>} Authentication tokens
 * @throws {AxiosError} When authentication fails
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Log login attempt (without password)
  console.log('Login attempt:', { email: credentials.email });
  
  try {
    const response = await axiosInstance.post<AuthResponse>("/api/login", credentials);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Registers a new user
 * @param {RegisterCredentials} credentials - User registration data
 * @returns {Promise<AuthResponse>} Authentication tokens for the new user
 * @throws {AxiosError} When registration fails
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { confirmPassword, ...registerPayload } = credentials;
  
  try {
    const response = await axiosInstance.post<AuthResponse>("/api/register", registerPayload);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logs out the current user by removing authentication tokens
 */
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Retrieves all tasks for the authenticated user
 * @returns {Promise<Task[]>} Array of user's tasks
 * @throws {AxiosError} When request fails or user is not authenticated
 */
export const getTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get<Task[]>("/api/tasks");
  return response.data;
};

/**
 * Creates a new task
 * @param {Omit<Task, "id" | "createdAt" | "updatedAt">} task - Task data without system-managed fields
 * @returns {Promise<Task>} Created task with generated ID and timestamps
 * @throws {AxiosError} When task creation fails or user is not authenticated
 */
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

/**
 * Updates an existing task
 * @param {string} taskId - ID of the task to update
 * @param {Partial<Task>} task - Partial task data to update
 * @returns {Promise<Task>} Updated task
 * @throws {AxiosError} When update fails or user is not authenticated
 */
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

/**
 * Deletes a task
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<void>}
 * @throws {AxiosError} When deletion fails or user is not authenticated
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
  return response.data;
};
