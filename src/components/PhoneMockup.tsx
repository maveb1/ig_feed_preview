import type { ReactNode } from 'react';

interface PhoneMockupProps {
  username: string;
  postCount: number;
  darkMode: boolean;
  children: ReactNode;
}

export function PhoneMockup({ username, postCount, darkMode, children }: PhoneMockupProps) {
  const displayName = username || 'your_instagram';

  return (
    <div className="phone-wrapper">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className={`phone-screen${darkMode ? ' phone-screen--dark' : ''}`}>
          <div className="ig-header">
            <div className="ig-header__top">
              <span className="ig-header__username">{displayName}</span>
            </div>
            <div className="ig-profile">
              <div className="ig-avatar">
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="ig-stats">
                <div className="ig-stat">
                  <strong>{postCount}</strong>
                  <span>posts</span>
                </div>
                <div className="ig-stat">
                  <strong>—</strong>
                  <span>followers</span>
                </div>
                <div className="ig-stat">
                  <strong>—</strong>
                  <span>following</span>
                </div>
              </div>
            </div>
            <div className="ig-actions">
              <button className="ig-btn ig-btn--primary">Follow</button>
              <button className="ig-btn ig-btn--secondary">Message</button>
            </div>
            <div className="ig-tabs">
              <span className="ig-tab ig-tab--active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </span>
              <span className="ig-tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="1"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </span>
              <span className="ig-tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="phone-feed">
            {children}
          </div>

          <div className="ig-bottom-nav">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12L12 3l9 9v9h-6v-6H9v6H3z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
