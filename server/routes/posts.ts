import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const POSTS_FILE = path.resolve(__dirname, '../data/posts.json');

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

/**
 * 데이터 파일 및 디렉토리 존재 여부 확인 및 초기화
 */
const ensureFileExists = (): void => {
  const dir = path.dirname(POSTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
};

/**
 * GET /api/posts
 * 모든 포스트 목록 조회
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    ensureFileExists();
    const rawData = fs.readFileSync(POSTS_FILE, 'utf-8');
    // BOM(Byte Order Mark) 제거 및 공백 정리
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    const posts: Post[] = cleanData ? JSON.parse(cleanData) : [];

    // 최신순 정렬
    res.json(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    console.error('Failed to read posts:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

/**
 * POST /api/posts
 * 새로운 포스트 저장
 */
router.post('/', (req: Request, res: Response): void => {
  const { title, draft, summary, owner, repo, imageUrl } = req.body;

  try {
    ensureFileExists();
    const rawData = fs.readFileSync(POSTS_FILE, 'utf-8');
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    const posts: Post[] = cleanData ? JSON.parse(cleanData) : [];

    const newPost: Post = {
      id: Date.now().toString(),
      title: title || 'Untitled Post',
      draft,
      summary,
      owner,
      repo,
      createdAt: new Date().toISOString(),
      published: false,
      imageUrl,
    };

    posts.push(newPost);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Failed to save post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

/**
 * PUT /api/posts/:id
 * 포스트 수정 (내용 변경 또는 발행 상태 토글)
 */
router.put('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const updates = req.body; // { title, draft, summary, published }

  try {
    ensureFileExists();
    const rawData = fs.readFileSync(POSTS_FILE, 'utf-8');
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    let posts: Post[] = cleanData ? JSON.parse(cleanData) : [];

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    posts[postIndex] = {
      ...posts[postIndex],
      ...updates,
    };

    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    res.json(posts[postIndex]);
  } catch (error) {
    console.error('Failed to save post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

/**
 * DELETE /api/posts/:id
 * 특정 포스트 삭제
 */
router.delete('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    ensureFileExists();
    const rawData = fs.readFileSync(POSTS_FILE, 'utf-8');
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    let posts: Post[] = cleanData ? JSON.parse(cleanData) : [];

    const filteredPosts = posts.filter((p) => p.id !== id);
    
    if (posts.length === filteredPosts.length) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    fs.writeFileSync(POSTS_FILE, JSON.stringify(filteredPosts, null, 2), 'utf-8');
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;