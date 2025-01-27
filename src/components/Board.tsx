import React, { useState, useCallback } from "react";
import { Board as BoardType, Task, TaskStatus } from "../types/interfaces";
import { TaskCard } from "./TaskCard";

interface BoardProps {
  board: BoardType;
  onTaskMove: (taskId: string, source: string, destination: string) => void;
  onAddTask: (title: string, columnId: TaskStatus) => Promise<void>;
  onAddList: (title: string) => void;
  onDelete: (taskId: string) => Promise<void>;
}

export const Board: React.FC<BoardProps> = ({
  board,
  onTaskMove,
  onAddTask,
  onAddList,
  onDelete,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedTaskRect, setDraggedTaskRect] = useState<DOMRect | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dragStartColumn, setDragStartColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.MouseEvent, task: Task, columnId: string) => {
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

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (draggedTask) {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, [draggedTask]);

  const handleDragEnd = useCallback((e: MouseEvent) => {
    if (draggedTask && dragStartColumn) {
      const columns = document.querySelectorAll('[data-column-id]');
      let targetColumn: Element | null = null;
      let closestDistance = Infinity;

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

    setDraggedTask(null);
    setDraggedTaskRect(null);
    setDragStartColumn(null);
  }, [draggedTask, dragStartColumn, onTaskMove]);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden p-2">
        {board.columns.map((column) => (
          <div
            key={column.id}
            data-column-id={column.id}
            className={`flex flex-col flex-shrink-0 w-72 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg max-h-full transition-all duration-200
              ${draggedTask && dragStartColumn !== column.id ? 'ring-2 ring-white/30' : ''}`}
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
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
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
          />
        </div>
      )}
    </div>
  );
};

export default Board;
