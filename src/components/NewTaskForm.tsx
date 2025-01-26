import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "../types/interfaces";

interface NewTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [task, setTask] = useState<
    Omit<Task, "id" | "createdAt" | "updatedAt">
  >({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: "",
    userId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(task);
    setTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      userId: "",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Create New Task
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                className="mt-1 input-field"
                placeholder="Task title"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={task.description}
                onChange={(e) =>
                  setTask({ ...task, description: e.target.value })
                }
                className="mt-1 input-field"
                rows={3}
                placeholder="Task description"
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="priority"
                value={task.priority}
                onChange={(e) =>
                  setTask({ ...task, priority: e.target.value as TaskPriority })
                }
                className="mt-1 input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                className="mt-1 input-field"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTaskForm;
