import React from 'react';
import styles from './PostViewer.module.css';

interface Props {
  title: string;
  content: string;
  imageUrl?: string;
  onBack: () => void;
}

export const PostViewer: React.FC<Props> = ({ title, content, imageUrl, onBack }) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <button className={styles.backBtn} onClick={onBack}>
          ← 목록으로 돌아가기
        </button>
      </div>
      <h1 className={styles.title}>{title}</h1>
      {imageUrl && (
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt={title} className={styles.image} />
        </div>
      )}
      <div className={styles.contentWrapper}>
        {content}
      </div>
    </div>
  );
};

export default PostViewer;