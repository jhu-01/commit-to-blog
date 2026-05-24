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
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const data = await response.json() as GitHubRepo[];
    res.json(data);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ error: 'Failed to fetch repositories from GitHub' });
  }
});

export default router;