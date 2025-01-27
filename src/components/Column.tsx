import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column as ColumnType, Task } from "../types/interfaces";
import TaskCard from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      columnId: column.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-type="Column"
      data-column-id={column.id}
      className={`flex flex-col flex-shrink-0 w-72 ${
        isOver ? "bg-white/20" : "bg-white/10"
      } backdrop-blur-lg rounded-xl shadow-lg max-h-full transition-colors`}
    >
      <div className="flex-shrink-0 px-3 py-2.5 flex items-center justify-between">
        <h3 className="font-medium text-white text-sm">
          {column.title} ({tasks.length})
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
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[1px]">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} columnId={column.id} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
