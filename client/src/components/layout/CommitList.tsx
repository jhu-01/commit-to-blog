import React, { useEffect, useState } from 'react';
import styles from './CommitList.module.css';

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
}

interface Props {
  owner: string;
  repo: string;
  onSummarize?: (selectedShas: string[]) => void;
}

export const CommitList: React.FC<Props> = ({ owner, repo, onSummarize }) => {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShas, setSelectedShas] = useState<string[]>([]);

  useEffect(() => {
    const fetchCommits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/github/repos/${owner}/${repo}/commits`);
        if (!response.ok) throw new Error('Failed to fetch commits');
        const data = await response.json();
        setCommits(data);
        setSelectedShas([]); // 레포 변경 시 선택 초기화
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (owner && repo) fetchCommits();
  }, [owner, repo]);

  const handleToggleCommit = (sha: string) => {
    setSelectedShas((prev) =>
      prev.includes(sha) ? prev.filter((s) => s !== sha) : [...prev, sha]
    );
  };

  const handleSummarizeClick = () => {
    if (onSummarize && selectedShas.length > 0) {
      onSummarize(selectedShas);
    }
  };

  if (isLoading) return <div className={styles.status}>Fetching commit logs...</div>;
  if (error) return <div className={styles.status}>Error: {error}</div>;
  if (!owner || !repo) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <h3 className={styles.title}>Recent Commits</h3>
        <span className={styles.count}>{selectedShas.length} selected</span>
      </div>

      <div className={styles.timeline}>
        {commits.map((item) => (
          <div 
            key={item.sha} 
            className={`${styles.commitItem} ${selectedShas.includes(item.sha) ? styles.selected : ''}`}
            onClick={() => handleToggleCommit(item.sha)}
          >
            <div className={styles.checkbox}>
              {selectedShas.includes(item.sha) ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="20" height="20" rx="4" fill="black"/>
                  <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" stroke="#E5E7EB"/>
                </svg>
              )}
            </div>

            <div className={styles.dot} />
            
            <div className={styles.content}>
              <div className={styles.header}>
                <span className={styles.author}>{item.commit.author.name}</span>
                <span className={styles.date}>
                  {new Date(item.commit.author.date).toLocaleDateString()}
                </span>
              </div>
              <p className={styles.message}>{item.commit.message}</p>
              <code className={styles.sha}>{item.sha.substring(0, 7)}</code>
            </div>
          </div>
        ))}
        {commits.length === 0 && !isLoading && (
          <div className={styles.empty}>No commits found in this repository.</div>
        )}
      </div>

      {selectedShas.length > 0 && (
        <div className={styles.actionArea}>
          <button 
            className={styles.summarizeButton}
            onClick={handleSummarizeClick}
          >
            Generate AI Summary ({selectedShas.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default CommitList;