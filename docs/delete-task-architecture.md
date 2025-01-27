# Delete Task Feature Architecture

## Overview
This document outlines the architecture for implementing a task deletion feature in the task management application.

## Components

### 1. API Layer (src/services/api.ts)
```typescript
async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete task');
}
```

### 2. Server Layer (server/server.js)
```javascript
app.delete('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    await task.remove();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### 3. Component Architecture

#### App.tsx
```typescript
const handleDeleteTask = async (taskId: string) => {
  try {
    // Optimistic update
    const updatedBoard = {
      ...board,
      tasks: { ...board.tasks },
      columns: board.columns.map(col => ({
        ...col,
        taskIds: col.taskIds.filter(id => id !== taskId)
      }))
    };
    delete updatedBoard.tasks[taskId];
    setBoard(updatedBoard);

    await deleteTask(taskId);
  } catch (error) {
    setError('Failed to delete task');
    // Revert optimistic update
    fetchTasks();
  }
};
```

#### TaskCard.tsx
```typescript
interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  return (
    <div className="relative">
      {/* Existing task content */}
      <button 
        onClick={() => onDelete(task.id)}
        className="delete-button"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
```

## Styling
```css
.delete-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: rgb(239 68 68); /* text-red-500 */
  padding: 4px;
  border-radius: 6px;
  transition: all 150ms;
}

.delete-button:hover {
  background-color: rgb(254 242 242); /* bg-red-50 */
}
```
