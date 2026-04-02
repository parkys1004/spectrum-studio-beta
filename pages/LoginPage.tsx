import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, isMockConfig } from '../lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 인증되어 있으면 메인으로 리다이렉트
    if (sessionStorage.getItem('app_auth') === 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsChecking(true);
    
    try {
      if (isMockConfig) {
        console.warn("⚠️ Firebase 환경 변수가 누락되었습니다. 임시 비밀번호 '1234'를 사용합니다.");
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        if (password === '1234') {
          sessionStorage.setItem('app_auth', 'true');
          navigate('/', { replace: true });
        } else {
          alert("비밀번호가 틀렸습니다.");
        }
        return;
      }

      const docRef = doc(db, "config", "globalconfig");
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const correctPw = snap.data()?.currentPassword;
        
        if (password === correctPw) {
          // 접속 로그 기록
          try {
            await addDoc(collection(db, "access_logs"), {
              action: "LOGIN_SUCCESS",
              time: new Date().toISOString(),
              app: "DoberSound_Service_App", // 어떤 앱인지 구분용
            });
          } catch (logError) {
            console.error("로그 기록 실패:", logError);
          }
          
          // 세션 스토리지에 인증 저장 (브라우저 닫으면 로그아웃됨)
          sessionStorage.setItem('app_auth', 'true');
          navigate('/', { replace: true });
        } else {
          alert("비밀번호가 틀렸습니다.");
        }
      } else {
        alert('서버에 비밀번호가 설정되지 않았습니다.');
      }
    } catch (error: any) {
      console.error("인증 실패:", error);
      
      // 오프라인 에러 발생 시 임시 비번으로 통과 (미리보기 환경용)
      if (error?.message?.includes('offline') || isMockConfig) {
        console.warn("⚠️ Firestore 연결 실패. 임시 비밀번호 '1234'를 사용합니다.");
        if (password === '1234') {
          sessionStorage.setItem('app_auth', 'true');
          navigate('/', { replace: true });
        } else {
          alert("비밀번호가 틀렸습니다. (오프라인 모드: 1234)");
        }
        return;
      }

      alert('인증 중 오류가 발생했습니다. (환경 변수 누락 등)');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center font-sans selection:bg-app-accent selection:text-white">
      <div className="bg-app-bg p-8 rounded-2xl shadow-neu-flat w-full max-w-md animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-app-bg text-app-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-btn">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-app-text">DoberSound 서비스 접속</h3>
          <p className="text-app-textMuted mt-2 text-sm">방구석작곡가님이 제공한 비밀번호를 입력하세요.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="비밀번호 입력"
              className="w-full bg-app-bg text-app-text px-4 py-3 rounded-xl shadow-neu-pressed focus:outline-none focus:ring-2 focus:ring-app-accent transition-all"
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            disabled={isChecking || !password}
            className="w-full bg-app-bg text-app-accent font-bold py-3 rounded-xl shadow-neu-btn hover:text-white hover:bg-app-accent active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12"
          >
            {isChecking ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '접속하기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
