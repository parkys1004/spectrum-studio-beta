import express from 'express';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import path from 'path';

// 서버 시작 시 딱 한 번만 파이어베이스 연결
if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ==========================================
  // API Routes (Next.js의 app/api/verify/route.ts 대체)
  // ==========================================
  app.get('/api/verify', async (req, res) => {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ canAccess: false, reason: 'missing-email' });
    }

    try {
      // 미리보기 환경 등에서 환경 변수가 없을 때의 예외 처리 (Mock)
      if (!admin.apps.length) {
        console.warn("⚠️ Firebase Admin 환경 변수가 없습니다. 임시 통과 처리합니다.");
        return res.json({ canAccess: true, tier: 'premium', name: 'Test User' });
      }

      const db = admin.firestore();
      
      // 1. 파이어베이스 'users' 컬렉션에서 해당 이메일 유저 찾기
      const userSnapshot = await db.collection('users').where('email', '==', email).get();

      if (userSnapshot.empty) {
        return res.json({ canAccess: false, reason: 'not-found' });
      }

      const userData = userSnapshot.docs[0].data();
      const now = new Date();
      const expiryDate = new Date(userData.subscriptionEndDate);

      // 2. 만료일 확인 (오늘 날짜와 비교)
      if (now > expiryDate) {
        return res.json({ canAccess: false, reason: 'expired' });
      }

      // 3. 통과 시 등급과 함께 응답
      return res.json({ 
        canAccess: true, 
        tier: userData.tier,
        name: userData.name 
      });
    } catch (error) {
      console.error("Verify API Error:", error);
      return res.status(500).json({ canAccess: false, reason: 'error' });
    }
  });

  // ==========================================
  // Vite Middleware (프론트엔드 서빙)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
