import React, { useState, useEffect } from "react";
import { Task, TaskPriority } from "../types/interfaces";

interface EditTaskFormProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
}

export const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  open,
  onClose,
  onSubmit,
}) => {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate || "",
    completed: task.completed || false,
  });

  useEffect(() => {
    if (open) {
      setEditedTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate || "",
        completed: task.completed || false,
      });
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(task.id, editedTask);
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-indigo-500/10 pointer-events-none" />

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Edit Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <input
              type="text"
              placeholder="Task Title"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-colors min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={editedTask.priority}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, priority: e.target.value as TaskPriority })
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="low" className="bg-gray-800">
                  Low
                </option>
                <option value="medium" className="bg-gray-800">
                  Medium
                </option>
                <option value="high" className="bg-gray-800">
                  High
                </option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={editedTask.dueDate}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              id="completed"
              checked={editedTask.completed}
              onChange={(e) =>
                setEditedTask({ ...editedTask, completed: e.target.checked })
              }
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="completed" className="text-sm font-medium">
              Mark as completed
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2.5 font-medium transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-2.5 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};