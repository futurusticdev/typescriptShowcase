import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box } from "@mui/material";
import { Board as BoardType } from "../types";
import Column from "./Column";
import TaskCard from "./TaskCard";

interface BoardProps {
  board: BoardType;
  onTaskMove: (
    taskId: string,
    sourceColumn: string,
    destinationColumn: string
  ) => void;
}

const Board: React.FC<BoardProps> = ({ board, onTaskMove }) => {
  const [activeTask, setActiveTask] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTask(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    if (!isActiveATask) return;

    const activeColumnId = board.columns.find((col) =>
      col.taskIds.includes(activeId as string)
    )?.id;

    const overColumnId = board.columns.find(
      (col) => col.id === overId || col.taskIds.includes(overId as string)
    )?.id;

    if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
      onTaskMove(activeId as string, activeColumnId, overColumnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    if (!isActiveATask) return;

    const activeColumnId = board.columns.find((col) =>
      col.taskIds.includes(activeId as string)
    )?.id;

    const overColumnId = board.columns.find(
      (col) => col.id === overId || col.taskIds.includes(overId as string)
    )?.id;

    if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
      onTaskMove(activeId as string, activeColumnId, overColumnId);
    }
  };

  const getActiveTask = () => {
    if (!activeTask) return null;
    return board.tasks[activeTask];
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          overflowX: "auto",
        }}
      >
        <SortableContext
          items={board.columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={column.taskIds.map((taskId) => board.tasks[taskId])}
            />
          ))}
        </SortableContext>
      </Box>
      <DragOverlay>
        {activeTask ? <TaskCard task={getActiveTask()!} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
