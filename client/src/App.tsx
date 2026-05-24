import { useState } from 'react';
import './styles/tokens.css';
import Layout from './components/layout/Layout';
import RepoSelector from './components/layout/RepoSelector';
import CommitList from './components/layout/CommitList';
import PostCardList from './components/post/PostCardList';
import Editor from './components/editor/Editor';
import LoadingSpinner from './components/common/LoadingSpinner';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
}

type ViewMode = 'posts' | 'selector' | 'commits' | 'editor';

function App() {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [currentDraft, setCurrentDraft] = useState<string>('');
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('posts');

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setViewMode('commits');
  };

  const handleNavigate = (view: 'posts' | 'selector') => {
    if (view === 'selector') setSelectedRepo(null);
    setViewMode(view);
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
      setCurrentTitle(`Blog post for ${selectedRepo.name}`);
      setViewMode('editor');
    } catch (err) {
      alert(err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePost = async (title: string, content: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          draft: content,
          summary: content.substring(0, 150) + '...',
          owner: selectedRepo?.full_name.split('/')[0] || 'Manual',
          repo: selectedRepo?.name || 'External',
        }),
      });

      if (!response.ok) throw new Error('저장에 실패했습니다.');
      
      alert('성공적으로 저장되었습니다!');
      setViewMode('posts');
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    }
  };

  const handleEditPost = (post: any) => {
    setCurrentTitle(post.title);
    setCurrentDraft(post.draft);
    setViewMode('editor');
  };

  return (
    <Layout currentView={viewMode} onNavigate={handleNavigate}>
      {isGenerating && <LoadingSpinner />}
      
      {viewMode === 'posts' && (
        <PostCardList onEditPost={handleEditPost} />
      )}

      {viewMode === 'selector' && (
        <RepoSelector 
          onSelectRepo={handleSelectRepo} 
          selectedRepoName={selectedRepo?.full_name} 
        />
      )}

      {viewMode === 'commits' && selectedRepo && (
        <CommitList 
          owner={selectedRepo.full_name.split('/')[0]!} 
          repo={selectedRepo.name} 
          onSummarize={handleSummarize}
        />
      )}

      {viewMode === 'editor' && (
        <Editor 
          initialContent={currentDraft} 
          onSave={handleSavePost}
          onCancel={() => setViewMode(selectedRepo ? 'commits' : 'posts')}
        />
      )}
    </Layout>
  );
}

export default App
