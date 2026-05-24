import { Router, Request, Response } from 'express';

const router = Router();

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

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

/**
 * GitHub API 공통 호출 및 에러 처리 헬퍼
 */
async function fetchFromGitHub<T>(url: string, PAT: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${PAT}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const status = response.status;
    throw { status, message: (errorData as any).message || 'GitHub API Error' };
  }

  return response.json() as Promise<T>;
}

/**
 * GET /api/github/repos
 * 사용자의 GitHub 레포지토리 목록을 조회합니다.
 */
router.get('/repos', async (_req: Request, res: Response): Promise<void> => {
  const PAT = process.env.GITHUB_PAT;

  if (!PAT) {
    res.status(500).json({ error: 'GITHUB_PAT is not configured in .env' });
    return;
  }

  try {
    const data = await fetchFromGitHub<GitHubRepo[]>('https://api.github.com/user/repos?sort=updated&per_page=100', PAT);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching GitHub repos:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Failed to fetch repositories' 
    });
  }
});

/**
 * GET /api/github/repos/:owner/:repo/branches
 * 특정 레포지토리의 브랜치 목록을 조회합니다.
 */
router.get('/repos/:owner/:repo/branches', async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const PAT = process.env.GITHUB_PAT;

  if (!PAT || !owner || !repo) {
    res.status(400).json({ error: 'Missing parameters or PAT' });
    return;
  }

  try {
    const data = await fetchFromGitHub<GitHubBranch[]>(`https://api.github.com/repos/${owner}/${repo}/branches`, PAT);
    res.json(data);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * GET /api/github/repos/:owner/:repo/commits
 * 특정 레포지토리/브랜치의 커밋 로그를 조회합니다.
 * Query: ?sha=branch_name
 */
router.get('/repos/:owner/:repo/commits', async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const { sha } = req.query; // 브랜치명 또는 SHA
  const PAT = process.env.GITHUB_PAT;

  if (!PAT || !owner || !repo) {
    res.status(400).json({ error: 'Missing parameters or PAT' });
    return;
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50${sha ? `&sha=${sha}` : ''}`;
    const data = await fetchFromGitHub<GitHubCommit[]>(url, PAT);
    res.json(data);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;