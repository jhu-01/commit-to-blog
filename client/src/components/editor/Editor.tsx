import React, { useState } from 'react';
import styles from './Editor.module.css';

interface Props {
  initialContent: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export const Editor: React.FC<Props> = ({ initialContent, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input 
          type="text" 
          className={styles.titleInput} 
          placeholder="포스트 제목을 입력하세요..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button className={styles.saveBtn} onClick={() => onSave(title, content)}>저장하기</button>
        </div>
      </div>
      
      <div className={styles.editorWrapper}>
        <textarea 
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="마크다운 내용을 편집하세요..."
        />
      </div>
    </div>
  );
};

export default Editor;