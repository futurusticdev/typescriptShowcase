import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Board as BoardType, Task, TaskStatus } from "../types/interfaces";
import TaskCard from "./TaskCard";

interface BoardProps {
  board: BoardType;
  onTaskMove: (taskId: string, source: string, destination: string) => void;
  onAddTask: (columnId: TaskStatus, title: string) => void;
  onAddList: (title: string) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  onTaskMove,
  onAddTask,
  onAddList,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newCardTitle, setNewCardTitle] = useState<{ [key: string]: string }>(
    {}
  );
  const [newListTitle, setNewListTitle] = useState("");
  const [showNewCardInput, setShowNewCardInput] = useState<{
    [key: string]: boolean;
  }>({});
  const [showNewListInput, setShowNewListInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board.tasks[active.id as string];
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    if (activeData.type === "Task" && overData.type === "Task") {
      // Handle task reordering within the same column or between columns
      const activeColumnId = activeData.columnId;
      const overColumnId = overData.columnId;

      if (activeColumnId !== overColumnId) {
        onTaskMove(activeId as string, activeColumnId, overColumnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    if (activeData.type === "Task" && overData.columnId) {
      const taskId = active.id as string;
      const sourceColumn = activeData.columnId;
      const destinationColumn = overData.columnId;

      if (sourceColumn !== destinationColumn) {
        onTaskMove(taskId, sourceColumn, destinationColumn);
      }
    }

    setActiveTask(null);
  };

  const handleAddCard = (columnId: TaskStatus) => {
    const title = newCardTitle[columnId]?.trim();
    if (title) {
      onAddTask(columnId, title);
      setNewCardTitle({ ...newCardTitle, [columnId]: "" });
    }
    setShowNewCardInput({ ...showNewCardInput, [columnId]: false });
  };

  const handleAddList = () => {
    const title = newListTitle.trim();
    if (title) {
      onAddList(title);
      setNewListTitle("");
    }
    setShowNewListInput(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden p-2">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col flex-shrink-0 w-72 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg"
            >
              <div className="flex-shrink-0 px-3 py-2.5 flex items-center justify-between">
                <h3 className="font-medium text-white text-sm">
                  {column.title}
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
              <div className="flex-1 min-h-0 px-2 pb-2">
                <SortableContext
                  items={column.taskIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-2 min-h-[1px]">
                      {column.taskIds.map((taskId) => {
                        const task = board.tasks[taskId];
                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            columnId={column.id}
                          />
                        );
                      })}
                    </div>
                    {showNewCardInput[column.id] ? (
                      <div className="mt-2 p-2 bg-white/5 rounded-lg">
                        <input
                          type="text"
                          value={newCardTitle[column.id] || ""}
                          onChange={(e) =>
                            setNewCardTitle({
                              ...newCardTitle,
                              [column.id]: e.target.value,
                            })
                          }
                          placeholder="Enter card title..."
                          className="w-full p-2 bg-white/10 rounded-lg text-white text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddCard(column.id);
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddCard(column.id)}
                            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm"
                          >
                            Add
                          </button>
                          <button
                            onClick={() =>
                              setShowNewCardInput({
                                ...showNewCardInput,
                                [column.id]: false,
                              })
                            }
                            className="px-3 py-1 hover:bg-white/10 text-white/60 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setShowNewCardInput({
                            ...showNewCardInput,
                            [column.id]: true,
                          })
                        }
                        className="mt-2 w-full py-2 px-3 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add a card
                      </button>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
          <div className="flex-shrink-0 w-72">
            {showNewListInput ? (
              <div className="p-2 bg-white/10 backdrop-blur-lg rounded-xl">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="w-full p-2 bg-white/10 rounded-lg text-white text-sm mb-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddList();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddList}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowNewListInput(false)}
                    className="px-3 py-1 hover:bg-white/10 text-white/60 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewListInput(true)}
                className="w-full h-10 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add another list
              </button>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default Board;
