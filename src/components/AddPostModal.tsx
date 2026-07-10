import { useRef, useState, type DragEvent } from 'react';
import type { PostStatus } from '../types';

interface AddPostModalProps {
  onAdd: (imageUrl: string, status: PostStatus) => void;
  onClose: () => void;
}

export function AddPostModal({ onAdd, onClose }: AddPostModalProps) {
  const [status, setStatus] = useState<PostStatus>('planned');
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleSubmit() {
    if (!preview) return;
    onAdd(preview, status);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Přidat příspěvek</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div
          className={`modal__dropzone ${isDragOver ? 'modal__dropzone--active' : ''} ${preview ? 'modal__dropzone--has-preview' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragOver(false)}
        >
          {preview ? (
            <img src={preview} alt="Náhled" className="modal__preview" />
          ) : (
            <>
              <span className="modal__dropzone-icon">🖼</span>
              <p>Přetáhni sem fotku nebo klikni pro výběr</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </div>

        <div className="modal__status">
          <button
            className={`status-btn ${status === 'existing' ? 'status-btn--active' : ''}`}
            onClick={() => setStatus('existing')}
          >
            Existující příspěvek
          </button>
          <button
            className={`status-btn status-btn--planned ${status === 'planned' ? 'status-btn--active' : ''}`}
            onClick={() => setStatus('planned')}
          >
            Plánovaný příspěvek
          </button>
        </div>

        <button
          className="modal__submit"
          onClick={handleSubmit}
          disabled={!preview}
        >
          Přidat do feedu
        </button>
      </div>
    </div>
  );
}
