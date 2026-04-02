import React, { useState } from 'react';
import { db, isFirebaseConfigured, verifyPassword } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function PasswordLock() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input) return;
    
    if (!isFirebaseConfigured) {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await verifyPassword(input);

      if (isValid) {
        // 접속 로그 기록 (누가, 어디서, 언제)
        try {
          await addDoc(collection(db, "access_logs"), {
            action: "LOGIN_SUCCESS",
            time: new Date().toISOString(),
            device: navigator.userAgent, // 기기 정보
          });
        } catch (logError) {
          console.error("Failed to log access", logError);
        }

        // 입장권(쿠키) 굽기 (24시간 유지)
        document.cookie = "app_access=true; path=/; max-age=86400";
        window.location.reload(); // 새로고침하여 메인 화면 진입
      } else {
        setError('비밀번호가 틀렸습니다. 다시 시도하세요.');
      }
    } catch (err: any) {
      console.error("Firebase error:", err);
      if (err.message === "DOCUMENT_MISSING") {
        setError('Firebase에 설정 문서가 없습니다. 임시 비밀번호 "0000"을 입력하여 접속하거나, 콘솔에서 config/globalconfig 문서를 생성해주세요.');
      } else {
        setError('데이터베이스 연결에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app-bg text-app-text">
      <div className="p-8 rounded-2xl shadow-neu-flat bg-app-panel flex flex-col items-center w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-app-text">앱 접속을 위해 비밀번호를 입력하세요</h2>
        <p className="text-app-textMuted mb-8 text-center">관리자가 제공한 비밀번호를 입력하세요.</p>
        
        <form onSubmit={handleCheck} className="w-full flex flex-col items-center">
          <input 
            type="password" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full p-4 text-lg text-center rounded-xl shadow-neu-pressed bg-app-bg border-none outline-none mb-4 focus:ring-2 focus:ring-app-accent text-app-text"
            disabled={isLoading}
          />
          
          {error && <p className="text-red-500 font-medium mb-4">{error}</p>}
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl shadow-neu-btn active:shadow-neu-pressed bg-app-accent text-white font-bold text-lg transition-all hover:bg-opacity-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '확인 중...' : '접속하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
