/**
 * Task related types
 * @typedef {("todo"|"inprogress"|"done")} BaseTaskStatus
 */
export type BaseTaskStatus = "todo" | "inprogress" | "done";
export type TaskStatus = BaseTaskStatus | `custom-${number}`;
export type TaskPriority = "low" | "medium" | "high";

// Valid status values
export const VALID_STATUSES: TaskStatus[] = ["todo", "inprogress", "done"];

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

// Server registration payload
export interface RegisterPayload extends LoginCredentials {}

// Client-side registration form data
export interface RegisterCredentials extends RegisterPayload {
  confirmPassword: string;
}

/**
 * Response from successful authentication
 * @interface AuthResponse
 * @property {string} accessToken - JWT access token with type: 'access'
 * @property {string} refreshToken - JWT refresh token with type: 'refresh'
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Response from token refresh operation
 * @interface RefreshResponse
 * @property {string} accessToken - New JWT access token
 * @property {string} refreshToken - New JWT refresh token
 */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// API Error type
export interface ApiError {
  error: string;
  status?: number;
}
