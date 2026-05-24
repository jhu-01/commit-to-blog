import React, { useState, useEffect } from 'react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState('AI가 커밋 로그를 분석하고 있습니다...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('거의 다 되었습니다. AI가 내용을 다듬고 있어요...');
    }, 10000); // 10초 후 메시지 변경 (UX 대응 전략 준수)

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <svg className={styles.spinner} width="50" height="50" viewBox="0 0 50 50">
          <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
        </svg>
        <p className={styles.text}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;