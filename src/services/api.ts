import axios from "axios";
import { Task } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = {
  // Fetch all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  },

  // Create a new task
  createTask: async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> => {
    const response = await axios.post(`${API_URL}/tasks`, {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: string, task: Partial<Task>): Promise<Task> => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, {
      ...task,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    await axios.delete(`${API_URL}/tasks/${taskId}`);
  },
};
