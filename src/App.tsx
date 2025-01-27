import React, { useState, useEffect } from "react";
import { Board } from "./components/Board";
import NewTaskForm from "./components/NewTaskForm";
import {
  Board as BoardType,
  Task,
  TaskStatus,
  TaskPriority,
  VALID_STATUSES
} from "./types/interfaces";
import { getTasks, createTask, updateTask, deleteTask } from "./services/api";
import Login from "./components/Login";
import Register from "./components/Register";

const createInitialBoard = (tasks: Task[]): BoardType => {
  const columns = VALID_STATUSES.map(status => {
    const title = status === "inprogress" ? "In Progress" :
                  status === "todo" ? "To Do" : "Done";
    return {
      id: status,
      title,
      taskIds: [] as string[]
    };
  });

  const tasksById: { [key: string]: Task } = {};
  tasks.forEach((task) => {
    tasksById[task.id] = task;
    const column = columns.find((col) => col.id === task.status);
    if (column) {
      column.taskIds.push(task.id);
    }
  });

  return {
    columns,
    tasks: tasksById,
  };
};

function App() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [view, setView] = useState<"login" | "register">("login");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchTasks();
    } else {
      localStorage.removeItem("token");
      setBoard(null);
    }
  }, [token]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "register") {
        setView("register");
      } else {
        setView("login");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const fetchTasks = async () => {
    try {
      const tasks = await getTasks();
      setBoard(createInitialBoard(tasks));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if ((error as any)?.response?.status === 401) {
        setToken(null);
      }
    }
  };

  const handleTaskMove = async (
    taskId: string,
    sourceColumn: TaskStatus,
    destinationColumn: TaskStatus
  ) => {
    if (!board) return;

    try {
      // Optimistically update the UI
      setBoard((prev) => {
        if (!prev) return prev;
        const newBoard = { ...prev };

        // Remove from source column
        const sourceColumnIndex = newBoard.columns.findIndex(
          (col) => col.id === sourceColumn
        );
        newBoard.columns[sourceColumnIndex].taskIds = newBoard.columns[
          sourceColumnIndex
        ].taskIds.filter((id) => id !== taskId);

        // Add to destination column
        const destColumnIndex = newBoard.columns.findIndex(
          (col) => col.id === destinationColumn
        );
        newBoard.columns[destColumnIndex].taskIds.push(taskId);

        // Update task status
        newBoard.tasks[taskId] = {
          ...newBoard.tasks[taskId],
          status: destinationColumn,
          updatedAt: new Date(),
        };

        return newBoard;
      });

      // Update the server
      await updateTask(taskId, {
        status: destinationColumn,
      });
    } catch (err) {
      setError("Failed to move task. Please try again.");
      // Revert the changes by refetching the board
      const tasks = await getTasks();
      setBoard(createInitialBoard(tasks));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistic update
      setBoard((prev) => {
        if (!prev) return prev;
        const newBoard = {
          ...prev,
          tasks: { ...prev.tasks },
          columns: prev.columns.map(col => ({
            ...col,
            taskIds: col.taskIds.filter(id => id !== taskId)
          }))
        };
        delete newBoard.tasks[taskId];
        return newBoard;
      });

      await deleteTask(taskId);
    } catch (error) {
      setError('Failed to delete task');
      // Revert optimistic update
      fetchTasks();
    }
  };

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Ensure task has a valid status
      const taskWithStatus = {
        ...taskData,
        status: taskData.status || "todo" as TaskStatus
      };
      const newTask = await createTask(taskWithStatus);
      setBoard((prev) => {
        if (!prev) return prev;
        const newBoard = { ...prev };

        // Add task to tasks object
        newBoard.tasks[newTask.id] = newTask;

        // Add task to appropriate column
        const columnIndex = newBoard.columns.findIndex(
          (col) => col.id === newTask.status
        );
        if (columnIndex !== -1) {
          newBoard.columns[columnIndex].taskIds.push(newTask.id);
        } else {
          console.error(`Column with status ${newTask.status} not found`);
        }

        return newBoard;
      });
    } catch (err) {
      setError("Failed to create task. Please try again.");
    }
  };

  const handleQuickAddTask = async (columnId: TaskStatus, title: string) => {
    try {
      if (!VALID_STATUSES.includes(columnId)) {
        setError(`Invalid status: ${columnId}. Task cannot be created.`);
        return;
      }
      
      const taskData = {
        title,
        description: "",
        status: columnId,
        priority: "medium" as TaskPriority,
        dueDate: null,
        userId: localStorage.getItem("userId") || "",
      };
      await handleCreateTask(taskData);
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error in handleQuickAddTask:", err);
    }
  };

  const handleAddList = (title: string) => {
    setBoard((prev) => {
      if (!prev) return prev;
      
      const newColumnId = `custom-${Date.now()}` as TaskStatus;
      const newColumn = {
        id: newColumnId,
        title,
        taskIds: [],
      };

      return {
        ...prev,
        columns: [...prev.columns, newColumn],
      };
    });
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return view === "register" ? (
      <Register onRegister={setToken} />
    ) : (
      <Login onLogin={setToken} />
    );
  }

  if (!board) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 overflow-hidden">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">My Tasks</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewTaskFormOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Task
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white/60"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <Board
          board={board}
          onTaskMove={handleTaskMove}
          onAddTask={handleQuickAddTask}
          onAddList={handleAddList}
          onDelete={handleDeleteTask}
        />
      </main>

      <NewTaskForm
        open={isNewTaskFormOpen}
        onClose={() => setIsNewTaskFormOpen(false)}
        onSubmit={handleCreateTask}
      />

      {error && (
        <div
          className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-lg border border-white/10 text-white px-4 py-3 rounded-xl shadow-lg"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg
              className="fill-current h-6 w-6 text-white/60"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
