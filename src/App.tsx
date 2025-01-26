import React, { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Fab,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Board from "./components/Board";
import NewTaskForm from "./components/NewTaskForm.tsx";
import { Board as BoardType, Task } from "./types";
import { api } from "./services/api";

const theme = createTheme();

const createInitialBoard = (tasks: Task[]): BoardType => {
  const columns = [
    { id: "todo", title: "To Do", taskIds: [] as string[] },
    { id: "inprogress", title: "In Progress", taskIds: [] as string[] },
    { id: "done", title: "Done", taskIds: [] as string[] },
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await api.getTasks();
        setBoard(createInitialBoard(tasks));
      } catch (err) {
        setError("Failed to load tasks. Please try again later.");
      }
    };
    fetchTasks();
  }, []);

  const handleTaskMove = async (
    taskId: string,
    sourceColumn: string,
    destinationColumn: string
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
      await api.updateTask(taskId, {
        status: destinationColumn as Task["status"],
      });
    } catch (err) {
      setError("Failed to move task. Please try again.");
      // Revert the changes by refetching the board
      const tasks = await api.getTasks();
      setBoard(createInitialBoard(tasks));
    }
  };

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newTask = await api.createTask(taskData);
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

  if (!board) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <Board board={board} onTaskMove={handleTaskMove} />
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => setIsNewTaskFormOpen(true)}
        >
          <AddIcon />
        </Fab>
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
