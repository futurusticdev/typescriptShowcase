import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority } from "../types/interfaces";

interface TaskCardProps {
  task: Task;
  columnId: string;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
      sortable: {
        containerId: columnId,
      },
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow p-3 cursor-pointer
        hover:shadow-md transition-shadow
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${priorityColors[task.priority]}
            `}
          >
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
