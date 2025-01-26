import React, { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Fab,
  Snackbar,
  Alert,
  Box,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Board from "./components/Board";
import NewTaskForm from "./components/NewTaskForm.tsx";
import { Board as BoardType, Task, TaskStatus } from "./types/interfaces";
import { getTasks, createTask, updateTask } from "./services/api";
import Login from "./components/Login";
import Register from "./components/Register";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const theme = createTheme();

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
          status: destinationColumn as Task["status"],
          updatedAt: new Date(),
        };

        return newBoard;
      });

      // Update the server
      await updateTask(taskId, {
        status: destinationColumn as Task["status"],
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
    return null; // Or a loading spinner
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setIsNewTaskFormOpen(true)}
          >
            Add Task
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        <DndContext onDragStart={() => {}} onDragEnd={() => {}}>
          <Board board={board} onTaskMove={handleTaskMove} />
        </DndContext>
        <NewTaskForm
          open={isNewTaskFormOpen}
          onClose={() => setIsNewTaskFormOpen(false)}
          onSubmit={handleCreateTask}
        />
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
