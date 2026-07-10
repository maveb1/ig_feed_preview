import { useState } from 'react';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [igUser, setIgUser] = useState('');
  const [igPass, setIgPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: igUser, password: igPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Přihlášení selhalo.');
      } else {
        setSuccess(data.message);
        setTimeout(() => { onSuccess(); onClose(); }, 1200);
      }
    } catch {
      setError('Backend neběží na portu 5050.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Přihlášení k Instagramu</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          <p style={{ fontSize: 13, color: '#737373', marginBottom: 14 }}>
            Přihlášení je nutné pro načítání většiny profilů. Údaje se používají pouze lokálně.
          </p>
          <input
            type="text"
            placeholder="Instagram uživatelské jméno"
            value={igUser}
            onChange={(e) => setIgUser(e.target.value)}
            className="profile-input"
            style={{ marginBottom: 8, display: 'block', width: '100%' }}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Heslo"
            value={igPass}
            onChange={(e) => setIgPass(e.target.value)}
            className="profile-input"
            style={{ marginBottom: 12, display: 'block', width: '100%' }}
            autoComplete="current-password"
          />
          {error && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          {success && <p style={{ color: '#15803d', fontSize: 13, marginBottom: 10 }}>{success}</p>}
          <button type="submit" className="modal__submit" disabled={loading || !igUser || !igPass}>
            {loading ? 'Přihlašuji…' : 'Přihlásit se'}
          </button>
        </form>
      </div>
    </div>
  );
}
