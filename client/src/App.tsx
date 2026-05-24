import { useState } from 'react';
import './styles/tokens.css';
import Layout from './components/layout/Layout';
import RepoSelector from './components/layout/RepoSelector';
import CommitList from './components/layout/CommitList';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
}

function App() {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleBackToList = () => {
    setSelectedRepo(null);
  };

  return (
    <Layout>
      {!selectedRepo ? (
        <RepoSelector 
          onSelectRepo={handleSelectRepo} 
          selectedRepoName={selectedRepo?.full_name} 
        />
      ) : (
        <CommitList 
          owner={selectedRepo.full_name.split('/')[0] || ''} 
          repo={selectedRepo.name} 
        />
      )}
    </Layout>
  );
}

export default App
