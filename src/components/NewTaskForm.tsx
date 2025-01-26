import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "../types/interfaces";

interface NewTaskFormProps {
  open: boolean;
  onSubmit: (task: Partial<Task>) => void;
  onClose: () => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  open,
  onSubmit,
  onClose,
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "todo" as TaskStatus,
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(task);
    // Reset form after submission
    setTask({
      title: "",
      description: "",
      priority: "medium" as TaskPriority,
      status: "todo" as TaskStatus,
      dueDate: "",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-indigo-500/10 pointer-events-none" />

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <input
              type="text"
              placeholder="Task Title"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-colors min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={task.priority}
                onChange={(e) =>
                  setTask({ ...task, priority: e.target.value as TaskPriority })
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
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2.5 font-medium transition-colors"
            >
              Create Task
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

export default NewTaskForm;
