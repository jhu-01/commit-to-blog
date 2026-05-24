import dotenv from 'dotenv';
import path from 'path';

// 라우터를 불러오기 전에 환경 변수를 가장 먼저, 절대 경로로 로드합니다.
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import githubRouter from './routes/github';
import blogRouter from './routes/blog'; // .js 확장자 없이 CJS 방식으로 임포트
import postsRouter from './routes/posts';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/github', githubRouter);
app.use('/api/blog', blogRouter);
app.use('/api/posts', postsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const hasGithub = !!process.env.GITHUB_PAT;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  console.log(`
🚀 [Backend] Server 가동 성공!
📍 접속 주소: http://localhost:${PORT}
🔗 상태 확인: http://localhost:${PORT}/health${!hasGithub || !hasGemini ? '\n⚠️ 경고: .env 환경 변수가 일부 누락되었습니다.' : ''}
🔑 GITHUB_PAT: ${hasGithub ? '✅ 로드됨' : '❌ 미설정'}
🔑 GEMINI_API_KEY: ${hasGemini ? '✅ 로드됨' : '❌ 미설정'}
  `);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다. 기존 프로세스를 종료해주세요.`);
  } else {
    console.error('❌ 서버 가동 중 에러 발생:', err);
  }
});

export default app;