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
}

export const CommitList: React.FC<Props> = ({ owner, repo }) => {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/github/repos/${owner}/${repo}/commits`);
        if (!response.ok) throw new Error('Failed to fetch commits');
        const data = await response.json();
        setCommits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (owner && repo) fetchCommits();
  }, [owner, repo]);

  if (isLoading) return <div className={styles.status}>Fetching commit logs...</div>;
  if (error) return <div className={styles.status}>Error: {error}</div>;
  if (!owner || !repo) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent Commits</h3>
      <div className={styles.timeline}>
        {commits.map((item) => (
          <div key={item.sha} className={styles.commitItem}>
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
    </div>
  );
};

export default CommitList;