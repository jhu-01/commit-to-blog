import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import githubRouter from './routes/github';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/github', githubRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend Server is running on http://localhost:${PORT}`);
});

export default app;