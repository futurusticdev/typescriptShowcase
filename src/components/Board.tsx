import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Board as BoardType, Task, TaskStatus, VALID_STATUSES } from "../types/interfaces";
import TaskCard from "./TaskCard";

interface BoardProps {
  board: BoardType;
  onTaskMove: (taskId: string, source: string, destination: string) => void;
  onAddTask: (title: string, columnId: TaskStatus) => Promise<void>;
  onAddList: (title: string) => void;
  onDelete: (taskId: string) => Promise<void>;
}
const Board: React.FC<BoardProps> = ({
  board,
  onTaskMove,
  onAddTask,
  onAddList,
  onDelete,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board.tasks[active.id as string];
    setActiveTask(task);
    setActiveColumn(active.data.current?.columnId);
  };

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Prevent self-drag
      if (activeId === overId) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Handle column drops
      if (overData?.type === "Column") {
        if (activeData?.columnId !== overData.columnId) {
          onTaskMove(activeId, activeData?.columnId, overData.columnId);
        }
        return;
      }

      // Handle task drops
      if (overData?.type === "Task") {
        if (activeData?.columnId !== overData.columnId) {
          onTaskMove(activeId, activeData?.columnId, overData.columnId);
        }
      }
    },
    [onTaskMove]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveTask(null);
      setActiveColumn(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData) return;

      // Handle final position update
      if (overData?.type === "Column") {
        const sourceColumnId = activeData.columnId;
        const destinationColumnId = overId;

        if (sourceColumnId !== destinationColumnId) {
          onTaskMove(activeId, sourceColumnId, destinationColumnId);
        }
      } else if (overData?.type === "Task") {
        const sourceColumnId = activeData.columnId;
        const destinationColumnId = overData.columnId;

        if (sourceColumnId !== destinationColumnId) {
          onTaskMove(activeId, sourceColumnId, destinationColumnId);
        }
      }
    },
    [onTaskMove]
  );

  return (
    <div className="h-full w-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden p-2">
          {board.columns.map((column) => {
            const { setNodeRef } = useDroppable({
              id: column.id,
              data: {
                type: "Column",
                columnId: column.id,
              },
            });

            return (
              <div
                key={column.id}
                ref={setNodeRef}
                data-type="Column"
                data-column-id={column.id}
                className="flex flex-col flex-shrink-0 w-72 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg max-h-full"
              >
                <div className="flex-shrink-0 px-3 py-2.5">
                  <h3 className="font-medium text-white text-sm">
                    {column.title}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  <SortableContext
                    items={column.taskIds}
                    strategy={verticalListSortingStrategy}
                    key={`${column.id}-${column.taskIds.length}`}
                  >
                    <div className="space-y-2 min-h-[1px]">
                      {column.taskIds.map((taskId) => {
                        const task = board.tasks[taskId];
                        return task ? (
                          <TaskCard
                            key={task.id}
                            task={task}
                            columnId={column.id}
                            isDragging={activeTask?.id === task.id}
                            onDelete={onDelete}
                          />
                        ) : null;
                      })}
                    </div>
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              columnId={activeColumn || ""}
              isDragging={true}
              onDelete={onDelete}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
