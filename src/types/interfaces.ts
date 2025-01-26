// Task related types
export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

// Board related types
export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

export interface Board {
  columns: Column[];
  tasks: {
    [key: string]: Task;
  };
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
}

// API Error type
export interface ApiError {
  error: string;
  status?: number;
}
