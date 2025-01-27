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
  onAddTask: (title: string) => Promise<void>;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, onAddTask }) => {
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
      className={`flex flex-col w-72 shrink-0 bg-white/10 backdrop-blur-lg rounded-xl ${
        isOver ? "ring-2 ring-white/50" : ""
      }`}
    >
      <div className="p-4 text-white font-medium flex items-center justify-between">
        <span>{column.title}</span>
        <span className="text-white/60 text-sm">{tasks.length}</span>
      </div>
      <div
        className="flex-1 overflow-y-auto px-2 pb-2"
        style={{ minHeight: "100px" }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
          key={`${column.id}-${tasks.length}`}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} columnId={column.id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
