import { useState, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { Post, PostStatus } from './types';
import { FeedGrid } from './components/FeedGrid';
import { AddPostModal } from './components/AddPostModal';
import { PhoneMockup } from './components/PhoneMockup';
import './App.css';

type GridView = 3 | 5;

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [profileInput, setProfileInput] = useState('');
  const [gridView, setGridView] = useState<GridView>(3);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = profileInput.trim();
    const match = input.match(/instagram\.com\/([^/?#]+)/);
    const parsed = match ? match[1] : input.replace('@', '');
    if (!parsed) return;

    setUsername(parsed);
    setFetchError('');
    setLoading(true);
    setPosts([]);

    try {
      const res = await fetch(`http://localhost:5050/api/profile/${parsed}`);
      const data = await res.json();

      if (!res.ok) {
        setFetchError(data.error ?? 'Nepodařilo se načíst profil.');
      } else {
        const fetched: Post[] = (data.posts as { id: string; imageUrl: string }[]).map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          status: 'existing' as PostStatus,
        }));
        setPosts(fetched);
      }
    } catch {
      setFetchError('Backend neběží. Spusť: python3 server.py');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = useCallback((imageUrl: string, status: PostStatus) => {
    const newPost: Post = { id: generateId(), imageUrl, status };
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const handleReorder = useCallback((activeId: string, overId: string) => {
    setPosts((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === activeId);
      const newIndex = prev.findIndex((p) => p.id === overId);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const plannedCount = posts.filter((p) => p.status === 'planned').length;
  const existingCount = posts.filter((p) => p.status === 'existing').length;

  const emptyGrid = (cols: 3 | 5) => (
    <div className="empty-state">
      <div className={`empty-state__grid empty-state__grid--${cols}`}>
        {Array.from({ length: cols === 3 ? 9 : 10 }).map((_, i) => (
          <div key={i} className="empty-state__cell" onClick={() => setModalOpen(true)} />
        ))}
      </div>
      {!loading && (
        <p className="empty-state__hint">
          {fetchError
            ? fetchError
            : 'Zadej Instagram profil nebo klikni pro ruční přidání příspěvku'}
        </p>
      )}
      {loading && <p className="empty-state__hint loading-hint">Načítám feed...</p>}
    </div>
  );

  return (
    <div className={`app${darkMode ? ' app--dark' : ''}`}>
      <header className="app-header">
        <div className="app-header__logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
          </svg>
          <span>Feed Preview</span>
        </div>
      </header>

      <main className="app-main">
        <div className="profile-section">
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <input
              type="text"
              placeholder="@uživatelské_jméno nebo URL profilu"
              value={profileInput}
              onChange={(e) => setProfileInput(e.target.value)}
              className="profile-input"
              disabled={loading}
            />
            <button type="submit" className="profile-btn" disabled={loading}>
              {loading ? 'Načítám…' : 'Načíst feed'}
            </button>
          </form>

          {fetchError && !loading && (
            <div className="profile-error">{fetchError}</div>
          )}

          {username && !fetchError && (
            <div className="profile-info">
              <div className="profile-avatar">
                {username[0]?.toUpperCase()}
              </div>
              <div className="profile-meta">
                <span className="profile-username">@{username}</span>
                <div className="profile-stats">
                  <span>{existingCount} existujících</span>
                  <span className="profile-stats__separator">·</span>
                  <span className="profile-stats__planned">{plannedCount} plánovaných</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="feed-section">
          <div className="feed-toolbar">
            <div />
            <div className="feed-toolbar__right">
              <button className="dark-toggle" onClick={() => setDarkMode(d => !d)} title="Přepnout dark/light mode">
                {darkMode ? '☀' : '☾'}
              </button>
              <div className="view-toggle">
                <button
                  className={`view-toggle__btn ${gridView === 3 ? 'view-toggle__btn--active' : ''}`}
                  onClick={() => setGridView(3)}
                >
                  Mobil
                </button>
                <button
                  className={`view-toggle__btn ${gridView === 5 ? 'view-toggle__btn--active' : ''}`}
                  onClick={() => setGridView(5)}
                >
                  Desktop
                </button>
              </div>
              <button className="add-btn" onClick={() => setModalOpen(true)}>
                + Přidat příspěvek
              </button>
            </div>
          </div>

          {gridView === 3 ? (
            <PhoneMockup username={username} postCount={existingCount} darkMode={darkMode}>
              {posts.length === 0 ? emptyGrid(3) : (
                <FeedGrid
                  posts={posts}
                  columns={3}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                  onAddClick={() => setModalOpen(true)}
                />
              )}
            </PhoneMockup>
          ) : (
            posts.length === 0 ? emptyGrid(5) : (
              <FeedGrid
                posts={posts}
                columns={5}
                onReorder={handleReorder}
                onRemove={handleRemove}
                onAddClick={() => setModalOpen(true)}
              />
            )
          )}
        </div>
      </main>

      {modalOpen && (
        <AddPostModal onAdd={handleAdd} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
