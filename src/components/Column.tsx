import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Paper, Typography } from "@mui/material";
import { Column as ColumnType, Task } from "../types";
import TaskCard from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        width: 300,
        minHeight: 500,
        backgroundColor: isOver ? "#e3f2fd" : "#f0f0f0",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        transition: "background-color 0.2s ease",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {column.title} ({tasks.length})
      </Typography>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </Paper>
  );
};

export default Column;
