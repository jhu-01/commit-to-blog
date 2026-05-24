import React from 'react';
import Header from './Header';
import styles from './Layout.module.css';

interface Props {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: 'posts' | 'selector') => void;
}

export const Layout: React.FC<Props> = ({ children, currentView, onNavigate }) => {
  return (
    <div className={styles.wrapper}>
      <Header currentView={currentView} onNavigate={onNavigate} />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>© 2026 Smart Blog. Built by jhu01. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;