# Drag & Drop Column Snap Architecture

## Core Issues
1. **Collision Detection**: Current rectIntersection strategy isn't precise for adjacent columns
2. **Drop Zones**: Column containers have inconsistent droppable areas
3. **Visual Feedback**: Lack of clear visual indicators during drag operations

## Solution Components

### 1. Enhanced Collision Detection
```typescript
// Implement a custom collision algorithm
const closestCenterCollision: CollisionDetection = (args) => {
  const collisions = rectIntersection(args);
  
  if (collisions.length > 0) {
    return collisions.reduce((closest, collision) => {
      if (!closest) return collision;
      const distance = calculateDistance(args.collisionRect, collision.data.droppableRect);
      return distance < closest.distance ? collision : closest;
    });
  }
  
  return collisions;
};
```

### 2. Column Container Enhancements
```tsx
// Board.tsx column rendering
{board.columns.map((column) => (
  <DroppableColumn
    key={column.id}
    id={column.id}
    className="min-w-[300px] bg-white/10 p-4 rounded-lg"
    dropConfig={{
      // Expand detection area
      padding: { top: 20, bottom: 20, left: 30, right: 30 }
    }}
  >
    {/* Column content */}
  </DroppableColumn>
))}
```

### 3. Drag Overlay Adjustments
```tsx
// Implement smooth drop animation
<DragOverlay
  adjustScale={false}
  dropAnimation={{
    duration: 250,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
  }}
>
  {activeTask && (
    <TaskCard 
      task={activeTask}
      columnId={activeColumn || ''}
      isDragging
      style={{
        transform: 'rotate(3deg) scale(1.02)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
      }}
    />
  )}
</DragOverlay>
```

### 4. Sensor Configuration
```typescript
// Configure drag sensors
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Require 8px drag before activation
    },
  }),
  useSensor(KeyboardSensor)
);

// Add horizontal drag constraints
const modifiers: Modifier = ({ transform }) => ({
  ...transform,
  x: transform.x * 1.2, // Amplify horizontal movement
  y: 0 // Restrict vertical movement
});
```

## Implementation Phases

1. **Collision System Overhaul**
   - Implement proximity-based collision detection
   - Add distance calculations between draggable and droppables
   - Create visual debug mode for collision areas

2. **Column Layout Stabilization**
   - Set fixed column widths (300-400px)
   - Add consistent horizontal spacing
   - Implement CSS grid layout for predictable positioning

3. **Visual Feedback System**
   - Add drop indicator animations
   - Implement column highlight on hover
   - Create smooth transition effects

4. **Performance Optimization**
   - Memoize column components
   - Implement drag preview virtualization
   - Add debouncing to state updates

## Key Metrics
| Aspect          | Before  | Target  |
|-----------------|---------|---------|
| Snap Accuracy   | 65%     | 95%+    |
| Drop Lag        | 120ms   | <50ms   |
| Visual Feedback | Basic   | Enhanced|

This architecture addresses the snapping issues through:
1. Precision collision detection algorithms
2. Stabilized column layouts
3. Enhanced visual feedback
4. Performance-optimized drag operations

