import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { registerStudyRoutes } from './src/server/studyHandler';
import { registerBuildRoutes } from './src/server/buildHandler';
import { registerQuizRoutes } from './src/server/quizHandler';
import { registerAccountRoutes } from './src/server/accountHandler';

dotenv.config();

const app = express();
const PORT = 3000;

// High-capacity JSON & URL-encoded body parsing for documents, source materials & sets
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Global Health & Status Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'PROUDLY AFRIKAN SCHOOL',
    version: '1.0.0',
    services: {
      study: true,
      build: true,
      quiz: true,
      planner: true,
      mysets: true,
      pricing: true,
      account: true,
    },
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Register all modular platform endpoints
registerStudyRoutes(app);
registerBuildRoutes(app);
registerQuizRoutes(app);
registerAccountRoutes(app);

// Vite middleware for development & Static hosting for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proudly Afrikan School server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
