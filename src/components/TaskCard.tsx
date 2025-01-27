import React from "react";
import { Task } from "../types/interfaces";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  columnId: string;
  isDragging?: boolean;
  onDelete?: (taskId: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, isDragging, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      data: {
        type: "Task",
        task,
        columnId,
      },
    });

  const style: React.CSSProperties = {
    touchAction: "none",
    transition,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
    ...(CSS.Transform.toString(transform)
      ? {
          transform: `${CSS.Transform.toString(transform)} translate3d(0,0,0)`,
        }
      : { transform: "translate3d(0,0,0)" }),
  };

  const priorityColors = {
    low: "bg-blue-500/20",
    medium: "bg-yellow-500/20",
    high: "bg-red-500/20",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg cursor-grab active:cursor-grabbing group transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-white group-hover:text-white/90">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-white/60 group-hover:text-white/70">
            {task.description}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                priorityColors[task.priority]
              } text-white/80`}
            >
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-white/60">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="self-end text-red-500 hover:bg-red-500/10 p-1 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
