import React from "react";
import { Task } from "../types/interfaces";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  columnId: string;
}

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
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      className={`p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg cursor-grab active:cursor-grabbing group transition-colors`}
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
      </div>
    </div>
  );
};

export default TaskCard;
