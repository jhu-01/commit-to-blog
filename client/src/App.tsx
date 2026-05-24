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
  const [currentDraft, setCurrentDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleSummarize = async (shas: string[]) => {
    if (!selectedRepo) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/blog/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.full_name.split('/')[0],
          repo: selectedRepo.name,
          shas
        }),
      });

      if (!response.ok) throw new Error('AI 요약 생성에 실패했습니다.');
      
      const data = await response.json();
      setCurrentDraft(data.draft);
      // TODO: 네비게이션을 Editor 뷰로 전환하는 로직 추가
    } catch (err) {
      alert(err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
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
          onSummarize={handleSummarize}
        />
      )}
    </Layout>
  );
}

export default App
