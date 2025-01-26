import React from "react";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Board as BoardType, Task } from "../types/interfaces";
import TaskCard from "./TaskCard";

interface BoardProps {
  board: BoardType;
  onTaskMove: (taskId: string, source: string, destination: string) => void;
}

const Board: React.FC<BoardProps> = ({ board, onTaskMove }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const sourceColumn = active.data.current?.sortable.containerId;
    const destinationColumn = over.data.current?.sortable.containerId;

    if (sourceColumn !== destinationColumn) {
      onTaskMove(taskId, sourceColumn, destinationColumn);
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(space.32))] p-6">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-72 bg-[#ebecf0] rounded-lg"
            >
              <div className="px-3 py-2.5">
                <h3 className="font-medium text-[#172b4d] text-sm">
                  {column.title}
                </h3>
              </div>
              <SortableContext
                items={column.taskIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="px-2 pb-2 space-y-2 min-h-[1px]">
                  {column.taskIds.map((taskId) => {
                    const task = board.tasks[taskId];
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        columnId={column.id}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default Board;
