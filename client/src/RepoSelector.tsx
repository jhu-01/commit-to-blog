import React, { useEffect, useState } from 'react';
import styles from './RepoSelector.module.css';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
}

interface Props {
  onSelectRepo: (repo: GitHubRepo) => void;
  selectedRepoName?: string;
}

export const RepoSelector: React.FC<Props> = ({ onSelectRepo, selectedRepoName }) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/github/repos');
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (isLoading) return <div className={styles.loading}>Loading repositories...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Repository</h2>
      <div className={styles.list}>
        {repos.map((repo) => (
          <button 
            key={repo.id} 
            className={`${styles.repoItem} ${
              selectedRepoName === repo.full_name ? styles.selected : ''
            }`}
            onClick={() => onSelectRepo(repo)}
            type="button"
          >
            <div className={styles.repoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7C2 5.89543 2.89543 5 4 5H9L11 7H20C21.1046 7 22 7.89543 22 9V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.repoInfo}>
              <span className={styles.repoName}>{repo.name}</span>
              <span className={styles.repoDescription}>{repo.description || 'No description'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RepoSelector;