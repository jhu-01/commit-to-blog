import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// --- Strict Interfaces ---
interface GitHubCommitFile {
  filename: string;
  status: string;
}

interface GitHubCommitDetail {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  files?: GitHubCommitFile[];
}

interface CommitSummaryInput {
  message: string;
  date: string;
  author: string;
  files: string[];
}

/**
 * GitHub 커밋 상세 정보를 가져오는 헬퍼
 */
async function getCommitDetails(owner: string, repo: string, sha: string, PAT: string): Promise<GitHubCommitDetail> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
    headers: {
      'Authorization': `token ${PAT}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch commit ${sha}`);
  return response.json();
}

/**
 * POST /api/blog/summarize
 */
router.post('/summarize', async (req: Request, res: Response): Promise<void> => {
  const { owner, repo, shas } = req.body;
  const PAT = process.env.GITHUB_PAT;

  if (!PAT || !owner || !repo || !Array.isArray(shas)) {
    res.status(400).json({ error: 'Invalid request parameters' });
    return;
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
      return;
    }

    // 2. 환경변수가 로드된 시점에 SDK 초기화
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. 선택된 모든 커밋의 상세 데이터 수집 (병렬)
    console.log(`[AI 요약] 커밋 상세 정보 가져오는 중... (SHAs: ${shas.length}개)`);
    const commitDataArray = await Promise.all(
      shas.map((sha: string) => getCommitDetails(owner, repo, sha, PAT))
    );

    // 2. 프롬프트 구성을 위한 데이터 정제
    const commitSummaries: CommitSummaryInput[] = commitDataArray.map((c: GitHubCommitDetail) => ({
      message: c.commit.message,
      date: c.commit.author.date,
      author: c.commit.author.name,
      // 파일 목록은 상위 5개만 추출
      files: c.files?.map((f: GitHubCommitFile) => f.filename).slice(0, 5) || [],
    }));

    // 3. Gemini Content Generation 요청 (사용자 요청 스타일에 맞춰 v1 API 명시)
    const client = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
    }, { apiVersion: 'v1' });

    const systemInstruction = `You are a Senior Software Engineer and an expert Tech Blogger. 
    Your goal is to transform raw Git commit messages into a professional, engaging, and structured technical blog post in Korean.
    Include sections: "Background & Problem", "Implementation Details", and "Reflection/Key Takeaways".`;
    
    const contents = `${systemInstruction}\n\nAnalyze these commits from repository '${repo}' and write a technical blog post: ${JSON.stringify(commitSummaries)}`;
    
    const result = await client.generateContent(contents);
    const draft = result.response.text();

    console.log('[AI 요약] 초안 생성 완료');
    res.json({ 
      draft,
      summary: draft.substring(0, 150) + '...' // 목록용 요약문
    });
  } catch (error: unknown) {
    console.error('❌ AI 요약 중 에러 발생:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

export default router;