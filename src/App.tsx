import React, { useState, useEffect } from "react";
import Board from "./components/Board";
import NewTaskForm from "./components/NewTaskForm";
import { Board as BoardType, Task, TaskStatus } from "./types/interfaces";
import { getTasks, createTask, updateTask } from "./services/api";
import Login from "./components/Login";
import Register from "./components/Register";
import { DndContext } from "@dnd-kit/core";

const createInitialBoard = (tasks: Task[]): BoardType => {
  const columns = [
    { id: "todo" as TaskStatus, title: "To Do", taskIds: [] as string[] },
    {
      id: "inprogress" as TaskStatus,
      title: "In Progress",
      taskIds: [] as string[],
    },
    { id: "done" as TaskStatus, title: "Done", taskIds: [] as string[] },
  ];

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

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newTask = await createTask(taskData);
      setBoard((prev) => {
        if (!prev) return prev;
        const newBoard = { ...prev };

        // Add task to tasks object
        newBoard.tasks[newTask.id] = newTask;

        // Add task to appropriate column
        const columnIndex = newBoard.columns.findIndex(
          (col) => col.id === newTask.status
        );
        newBoard.columns[columnIndex].taskIds.push(newTask.id);

        return newBoard;
      });
    } catch (err) {
      setError("Failed to create task. Please try again.");
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsNewTaskFormOpen(true)}
              className="btn-primary flex items-center gap-2"
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
            <button onClick={handleLogout} className="btn-outline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DndContext>
          <Board board={board} onTaskMove={handleTaskMove} />
        </DndContext>
      </main>

      <NewTaskForm
        open={isNewTaskFormOpen}
        onClose={() => setIsNewTaskFormOpen(false)}
        onSubmit={handleCreateTask}
      />

      {error && (
        <div
          className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
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
