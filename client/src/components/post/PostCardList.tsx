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
}

interface Props {
  onEditPost: (post: Post) => void;
}

export const PostCardList: React.FC<Props> = ({ onEditPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
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
    fetchPosts();
  }, []);

  if (isLoading) return <div className={styles.loading}>Loading saved posts...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Saved Posts</h1>
      <div className={styles.grid}>
        {posts.map((post) => (
          <div key={post.id} className={styles.card} onClick={() => onEditPost(post)}>
            <div className={styles.cardHeader}>
              <span className={styles.tag}>{post.repo}</span>
              <span className={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className={styles.title}>{post.title}</h2>
            <p className={styles.summary}>{post.summary}</p>
            <div className={styles.footer}>
              <span className={styles.author}>{post.owner}</span>
              <button className={styles.editBadge}>Edit Draft</button>
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