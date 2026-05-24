import React, { useEffect, useState } from 'react';
import styles from './PostCardList.module.css';

interface Post {
  id: string;
  title: string;
  draft: string;
  summary: string;
  owner: string;
  repo: string;
  createdAt: string;
  published: boolean;
  imageUrl?: string;
}

interface Props {
  onEditPost: (post: Post) => void;
}

export const PostCardList: React.FC<Props> = ({ onEditPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTogglePublish = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation(); // 카드 클릭 이벤트(편집) 방지
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      if (response.ok) {
        fetchPosts(); // 목록 갱신
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('이 포스트를 정말 삭제할까요?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading saved posts...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Saved Posts</h1>
      <div className={styles.grid}>
        {posts.map((post) => (
          <div key={post.id} className={styles.card} onClick={() => onEditPost(post)}>
            <div className={styles.cardHeader}>
              <div className={styles.metaLeft}>
                <span className={styles.tag}>{post.repo}</span>
                <span className={`${styles.statusBadge} ${post.published ? styles.published : ''}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <span className={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className={styles.title}>{post.title}</h2>
            {post.imageUrl && (
              <div className={styles.thumbnailWrapper}>
                <img src={post.imageUrl} alt={post.title} className={styles.thumbnail} />
              </div>
            )}
            <p className={styles.summary}>{post.summary}</p>
            <div className={styles.footer}>
              <span className={styles.author}>{post.owner}</span>
              <div className={styles.actions}>
                <button 
                  className={styles.deleteBtn} 
                  onClick={(e) => handleDeletePost(e, post.id)}
                  title="Delete post"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                  </svg>
                </button>
                <button 
                  className={styles.publishToggle} 
                  onClick={(e) => handleTogglePublish(e, post)}
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>📂</div>
            <p>저장된 포스트가 없습니다.</p>
            <span>New Draft 버튼을 눌러 첫 글을 작성해보세요!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCardList;