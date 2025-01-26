import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  rectIntersection,
  DragOverlay,
  defaultDropAnimationSideEffects,
  Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Board as BoardType, Task, TaskStatus } from "../types/interfaces";
import TaskCard from "./TaskCard";

interface BoardProps {
  board: BoardType;
  onTaskMove: (taskId: string, source: string, destination: string) => void;
  onAddTask: (columnId: TaskStatus, title: string) => Promise<void>;
  onAddList: (title: string) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  onTaskMove,
  onAddTask,
  onAddList,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
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
        delay: 0,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board.tasks[active.id as string];
    setActiveTask(task);
    setActiveColumn(active.data.current?.columnId);
  };

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData || !overData) return;

      // Handle dropping on a column
      if (overData.type === "Column") {
        const sourceColumnId = activeData.columnId;
        const destinationColumnId = overId;

        if (sourceColumnId !== destinationColumnId) {
          onTaskMove(activeId, sourceColumnId, destinationColumnId);
        }
        return;
      }

      // Handle dropping on another task
      if (activeData.type === "Task" && overData.type === "Task") {
        const sourceColumnId = activeData.columnId;
        const destinationColumnId = overData.columnId;

        if (sourceColumnId !== destinationColumnId) {
          onTaskMove(activeId, sourceColumnId, destinationColumnId);
        }
      }
    },
    [onTaskMove]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) {
        setActiveTask(null);
        setActiveColumn(null);
        return;
      }

      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData || !overData) {
        setActiveTask(null);
        setActiveColumn(null);
        return;
      }

      // Final position update
      if (activeData.type === "Task") {
        const sourceColumnId = activeData.columnId;
        const destinationColumnId =
          overData.type === "Column" ? overId : overData.columnId;

        if (sourceColumnId !== destinationColumnId) {
          onTaskMove(activeId, sourceColumnId, destinationColumnId);
        }
      }

      setActiveTask(null);
      setActiveColumn(null);
    },
    [onTaskMove]
  );

  const handleAddCard = async (columnId: TaskStatus) => {
    const title = newCardTitle[columnId]?.trim();
    if (title) {
      try {
        await onAddTask(columnId, title);
        setNewCardTitle({ ...newCardTitle, [columnId]: "" });
        setShowNewCardInput({ ...showNewCardInput, [columnId]: false });
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    }
  };

  const handleAddList = () => {
    const title = newListTitle.trim();
    if (title) {
      onAddList(title);
      setNewListTitle("");
      setShowNewListInput(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[
          ((args) => ({
            ...args,
            x: args.transform.x,
            y: args.transform.y,
            scaleX: 1,
            scaleY: 1,
          })) as Modifier,
        ]}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden p-2">
          {board.columns.map((column) => {
            const { setNodeRef } = useDroppable({
              id: column.id,
              data: {
                type: "Column",
                column,
              },
            });

            return (
              <div
                key={column.id}
                ref={setNodeRef}
                className="flex flex-col flex-shrink-0 w-72 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg max-h-full"
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
                <div className="flex-1 overflow-y-auto px-2 pb-2 touch-none">
                  <SortableContext
                    items={column.taskIds}
                    strategy={verticalListSortingStrategy}
                    key={`${column.id}-${column.taskIds.length}`}
                  >
                    <div className="space-y-2">
                      {column.taskIds.map((taskId) => {
                        const task = board.tasks[taskId];
                        return task ? (
                          <TaskCard
                            key={task.id}
                            task={task}
                            columnId={column.id}
                            isDragging={activeTask?.id === task.id}
                          />
                        ) : null;
                      })}
                    </div>
                  </SortableContext>
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
                        autoFocus
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
              </div>
            );
          })}
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
                  autoFocus
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
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              columnId={activeColumn || ""}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
