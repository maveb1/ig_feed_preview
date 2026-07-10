import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Post } from '../types';
import { FeedCell, EmptyCell } from './FeedCell';

interface FeedGridProps {
  posts: Post[];
  columns: 3 | 5;
  onReorder: (activeId: string, overId: string) => void;
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

export function FeedGrid({ posts, columns, onReorder, onRemove, onAddClick }: FeedGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  const gridSize = columns === 3 ? 9 : 10;
  const emptyCellsCount = Math.max(0, gridSize - posts.length);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={posts.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className={`feed-grid feed-grid--${columns}`}>
          {posts.map((post, index) => (
            <FeedCell
              key={post.id}
              post={post}
              index={index}
              onRemove={onRemove}
            />
          ))}
          {emptyCellsCount > 0 && (
            <EmptyCell onClick={onAddClick} />
          )}
          {Array.from({ length: Math.max(0, emptyCellsCount - 1) }).map((_, i) => (
            <div key={`placeholder-${i}`} className="feed-cell feed-cell--placeholder" />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
