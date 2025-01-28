import React, { useState, useCallback, useEffect } from "react";
import { Board as BoardType, Task, TaskStatus, Column } from "../types/interfaces";
import { TaskCard } from "./TaskCard";
import { NewColumnButton } from "./NewColumnButton";

/**
 * Props for the Board component
 * @interface BoardProps
 * @property {BoardType} board - The board data containing columns and tasks
 * @property {function} onTaskMove - Callback when a task is moved between columns
 * @property {function} onAddTask - Callback to add a new task to a column
 * @property {function} onAddList - Callback to add a new column to the board
 * @property {function} onDelete - Callback to delete a task
 */
interface BoardProps {
  board: BoardType;
  onTaskMove: (taskId: string, source: string, destination: string) => void;
  onAddTask: (title: string, columnId: TaskStatus) => Promise<void>;
  onAddList: (title: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
}

/**
 * Board component that implements a Kanban-style board with drag and drop functionality
 * Renders columns of tasks and handles drag-and-drop task movement between columns
 *
 * @component
 * @param {BoardProps} props - The component props
 * @returns {JSX.Element} Rendered Board component
 */
export const Board: React.FC<BoardProps> = ({
  board,
  onTaskMove,
  onAddTask,
  onAddList,
  onDelete,
  onEdit,
}) => {
  /** Currently dragged task */
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  /** Original DOM rectangle of the dragged task for positioning */
  const [draggedTaskRect, setDraggedTaskRect] = useState<DOMRect | null>(null);
  /** Offset of mouse position from task element's top-left corner */
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  /** Current mouse position during drag */
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  /** Column ID where the drag started */
  const [dragStartColumn, setDragStartColumn] = useState<string | null>(null);

  /**
   * Initializes drag operation for a task
   * @param {React.MouseEvent} e - Mouse event that triggered the drag
   * @param {Task} task - The task being dragged
   * @param {string} columnId - ID of the column the task is being dragged from
   */
  const handleDragStart = (e: React.MouseEvent, task: Task, columnId: string) => {
    e.preventDefault(); // Prevent text selection
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setDraggedTask(task);
    setDraggedTaskRect(rect);
    setDragStartColumn(columnId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  /**
   * Updates task position during drag
   * @param {MouseEvent} e - Mouse move event
   */
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (draggedTask) {
      e.preventDefault(); // Prevent text selection during drag
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, [draggedTask]);

  /**
   * Handles the end of a drag operation
   * Calculates closest column and moves task if necessary
   * @param {MouseEvent} e - Mouse up event
   */
  const handleDragEnd = useCallback((e: MouseEvent) => {
    if (draggedTask && dragStartColumn) {
      const columns = document.querySelectorAll('[data-column-id]');
      let targetColumn: Element | null = null;
      let closestDistance = Infinity;

      // Find the closest column to the drop position
      columns.forEach(column => {
        const rect = column.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          targetColumn = column;
        }
      });

      if (targetColumn) {
        const targetColumnId = targetColumn.getAttribute('data-column-id');
        if (targetColumnId && targetColumnId !== dragStartColumn) {
          onTaskMove(draggedTask.id, dragStartColumn, targetColumnId);
        }
      }
    }

    // Reset drag state
    setDraggedTask(null);
    setDraggedTaskRect(null);
    setDragStartColumn(null);
  }, [draggedTask, dragStartColumn, onTaskMove]);

  // Set up event listeners for drag operations
  React.useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return (
    <div className="h-full w-full flex flex-col select-none">
      <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden p-2">
        {board.columns.map((column) => (
          <div
            key={column.id}
            data-column-id={column.id}
            className={`flex flex-col flex-shrink-0 w-72 bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-xl shadow-lg max-h-full transition-all duration-200
              ${draggedTask && dragStartColumn !== column.id ? 'ring-2 ring-white/30 dark:ring-white/50' : ''}`}
          >
            <div className="flex-shrink-0 px-3 py-2.5">
              <h3 className="font-medium text-white text-sm">
                {column.title}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              <div className="space-y-2 min-h-[1px]">
                {column.taskIds.map((taskId) => {
                  const task = board.tasks[taskId];
                  return task ? (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columnId={column.id}
                      onDragStart={handleDragStart}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
        <NewColumnButton onAdd={onAddList} />
      </div>
      {/* Render dragged task preview */}
      {draggedTask && draggedTaskRect && (
        <div
          style={{
            position: 'fixed',
            left: mousePosition.x - dragOffset.x,
            top: mousePosition.y - dragOffset.y,
            width: draggedTaskRect.width,
            height: draggedTaskRect.height,
            transform: 'rotate(3deg) scale(1.05)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <TaskCard
            task={draggedTask}
            columnId={dragStartColumn || ""}
            isDragging={true}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      )}
    </div>
  );
};
