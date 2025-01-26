import axios from "axios";
import { Task } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/api/tasks");
  return response.data;
};

export const createTask = async (
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> => {
  const response = await api.post("/api/tasks", {
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
  const response = await api.put(`/api/tasks/${taskId}`, {
    ...task,
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await api.delete(`/api/tasks/${taskId}`);
  return response.data;
};
