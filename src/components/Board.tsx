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
    <div className="h-full w-full">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto overflow-y-hidden px-2 pb-2">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-72 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg"
            >
              <div className="px-3 py-2.5 flex items-center justify-between">
                <h3 className="font-medium text-white text-sm">
                  {column.title}
                </h3>
                <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white/60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
              <SortableContext
                items={column.taskIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="px-2 pb-2 flex-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
                  <div className="space-y-2">
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
                  <button className="mt-2 w-full py-2 px-3 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm">
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
                    Add a card
                  </button>
                </div>
              </SortableContext>
            </div>
          ))}
          <div className="flex-shrink-0 w-72">
            <button className="w-full h-10 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors text-sm">
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
              Add another list
            </button>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default Board;
