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
    <div className="min-h-[calc(100vh-theme(space.32))] bg-blue-50 p-6">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-lg shadow-md"
            >
              <div className="p-4 bg-gray-200 rounded-t-lg">
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
              </div>
              <SortableContext
                items={column.taskIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="p-4 space-y-3 min-h-[200px]">
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
