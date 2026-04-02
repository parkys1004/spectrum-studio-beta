import React, { useState } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

export default function PasswordLock() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    if (!input) return;
    
    if (!isFirebaseConfigured) {
      alert("Firebase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하거나 환경변수(VITE_FIREBASE_API_KEY 등)를 설정해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. 파이어베이스에서 실시간 비번 가져오기
      const docRef = doc(db, "config", "globalconfig");
      const snap = await getDoc(docRef);
      
      if (!snap.exists()) {
        alert("설정된 비밀번호가 없습니다. 관리자에게 문의하세요.");
        setIsLoading(false);
        return;
      }
      
      const correctPw = snap.data().currentPassword;

      if (input === correctPw) {
        // 2. 접속 로그 기록 (누가, 어디서, 언제)
        await addDoc(collection(db, "access_logs"), {
          action: "LOGIN_SUCCESS",
          time: new Date().toISOString(),
          device: navigator.userAgent, // 기기 정보
        });

        // 3. 입장권(쿠키) 굽기 (24시간 유지)
        document.cookie = "app_access=true; path=/; max-age=86400";
        window.location.reload(); // 새로고침하여 메인 화면 진입
      } else {
        alert("비밀번호가 틀렸습니다!");
      }
    } catch (error: any) {
      console.error("Firebase error:", error);
      if (error?.message?.includes('client is offline')) {
        alert("Firebase에 연결할 수 없습니다. 환경변수 값이 올바른지 확인해주세요.");
      } else {
        alert("데이터베이스 연결에 실패했습니다. 환경변수를 확인해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app-bg text-app-text">
      <div className="p-8 rounded-2xl shadow-neu-flat bg-app-panel flex flex-col items-center w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-app-text">DoberSound 서비스 접속</h2>
        <p className="text-app-textMuted mb-8 text-center">관리자가 제공한 비밀번호를 입력하세요.</p>
        
        <input 
          type="password" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="비밀번호 입력"
          className="w-full p-4 text-lg text-center rounded-xl shadow-neu-pressed bg-app-bg border-none outline-none mb-8 focus:ring-2 focus:ring-app-accent text-app-text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCheck();
            }
          }}
          disabled={isLoading}
        />
        
        <button 
          onClick={handleCheck} 
          disabled={isLoading}
          className={`w-full py-4 rounded-xl shadow-neu-btn active:shadow-neu-pressed bg-app-accent text-white font-bold text-lg transition-all hover:bg-opacity-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '확인 중...' : '접속하기'}
        </button>
      </div>
    </div>
  );
}
