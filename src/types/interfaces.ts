/**
 * Valid task statuses that can be used in the base system
 * @typedef {("todo"|"inprogress"|"done")} BaseTaskStatus
 */
export type BaseTaskStatus = "todo" | "inprogress" | "done";

/**
 * Extended task status that allows for custom columns with numeric IDs
 * @typedef {BaseTaskStatus|`custom-${number}`} TaskStatus
 */
export type TaskStatus = BaseTaskStatus | `custom-${number}`;

/**
 * Priority levels available for tasks
 * @typedef {("low"|"medium"|"high")} TaskPriority
 */
export type TaskPriority = "low" | "medium" | "high";

/** Default valid status values for task organization */
export const VALID_STATUSES: TaskStatus[] = ["todo", "inprogress", "done"];

/**
 * Represents a task in the system
 * @interface Task
 * @property {string} id - Unique identifier for the task
 * @property {string} title - Title of the task
 * @property {string} description - Detailed description of the task
 * @property {TaskStatus} status - Current status of the task
 * @property {TaskPriority} priority - Priority level of the task
 * @property {string} [dueDate] - Optional due date for the task
 * @property {Date|string} createdAt - Timestamp when the task was created
 * @property {Date|string} updatedAt - Timestamp when the task was last updated
 * @property {string} userId - ID of the user who owns the task
 */
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

/**
 * Represents a column in the kanban board
 * @interface Column
 * @property {TaskStatus} id - Unique identifier for the column, matches the task status
 * @property {string} title - Display title of the column
 * @property {string[]} taskIds - Array of task IDs contained in this column
 */
export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

/**
 * Represents the entire kanban board state
 * @interface Board
 * @property {Column[]} columns - Array of columns in the board
 * @property {Object.<string, Task>} tasks - Map of task IDs to task objects
 */
export interface Board {
  columns: Column[];
  tasks: {
    [key: string]: Task;
  };
}

/**
 * Credentials required for user login
 * @interface LoginCredentials
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Payload for user registration
 * @interface RegisterPayload
 * @extends LoginCredentials
 */
export interface RegisterPayload extends LoginCredentials {}

/**
 * Client-side registration form data including password confirmation
 * @interface RegisterCredentials
 * @extends RegisterPayload
 * @property {string} confirmPassword - Password confirmation field
 */
export interface RegisterCredentials extends RegisterPayload {
  confirmPassword: string;
}

/**
 * Response from successful authentication
 * @interface AuthResponse
 * @property {string} token - JWT access token
 * @property {string} refreshToken - JWT refresh token for obtaining new access tokens
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
}

/**
 * Response from token refresh operation
 * @interface RefreshResponse
 * @property {string} token - New JWT access token
 * @property {string} refreshToken - New JWT refresh token
 */
export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

/**
 * Standardized API error response
 * @interface ApiError
 * @property {string} error - Error message
 * @property {number} [status] - Optional HTTP status code
 */
export interface ApiError {
  error: string;
  status?: number;
}
