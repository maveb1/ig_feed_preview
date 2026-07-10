import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Post } from '../types';

interface FeedCellProps {
  post: Post;
  index: number;
  onRemove: (id: string) => void;
}

export function FeedCell({ post, index, onRemove }: FeedCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`feed-cell ${post.status === 'planned' ? 'feed-cell--planned' : ''} ${isDragging ? 'feed-cell--dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="feed-cell__inner">
        <img src={post.imageUrl} alt={`Post ${index + 1}`} draggable={false} />

        <button
          className="feed-cell__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(post.id);
          }}
          title="Odebrat"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface EmptyCellProps {
  onClick: () => void;
}

export function EmptyCell({ onClick }: EmptyCellProps) {
  return (
    <div className="feed-cell feed-cell--empty" onClick={onClick}>
      <div className="feed-cell__inner">
        <span className="feed-cell__plus">+</span>
      </div>
    </div>
  );
}
