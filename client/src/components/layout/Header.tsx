import React from 'react';
import styles from './Header.module.css';

interface Props {
  currentView: string;
  onNavigate: (view: 'posts' | 'selector') => void;
}

export const Header: React.FC<Props> = ({ currentView, onNavigate }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.23 2.1a1.1 1.1 0 0 1 1.54 0l9.13 9.13a1.1 1.1 0 0 1 0 1.54l-9.13 9.13a1.1 1.1 0 0 1-1.54 0L2.1 12.77a1.1 1.1 0 0 1 0-1.54l9.13-9.13Z" fill="#F05032"/>
            <circle cx="12" cy="15" r="2.5" fill="white"/>
            <circle cx="8" cy="8.5" r="2" fill="white"/>
            <path d="M8 10.5v3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8.5 13.5c1.5 1 2 1 3.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="14" cy="8.5" r="2" fill="white"/>
          </svg>
          <span className={styles.title}>Smart Blog</span>
        </div>
        
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${currentView === 'posts' ? styles.active : ''}`}
            onClick={() => onNavigate('posts')}
          >
            Saved Posts
          </button>
          <button 
            className={`${styles.navItem} ${currentView !== 'posts' ? styles.active : ''}`}
            onClick={() => onNavigate('selector')}
          >
            New Draft
          </button>
        </nav>

        <div className={styles.profile}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#E5E7EB"/>
            <path d="M16 8C13.7909 8 12 9.79086 12 12C12 14.2091 13.7909 16 16 16C18.2091 16 20 14.2091 20 12C20 9.79086 18.2091 8 16 8Z" fill="#6B7280"/>
            <path d="M16 18C11.5817 18 8 21.5817 8 26H24C24 21.5817 20.4183 18 16 18Z" fill="#6B7280"/>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;