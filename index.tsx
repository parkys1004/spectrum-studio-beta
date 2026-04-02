import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { checkAppPassword } from './firebase';

function UserApp() {
  const [isLocked, setIsLocked] = useState(true);
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 이미 인증된 기기인지 확인
    if (localStorage.getItem('app_auth') === 'true') {
      setIsLocked(false);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsChecking(true);
    const success = await checkAppPassword(input);
    setIsChecking(false);
    if (success) {
      localStorage.setItem('app_auth', 'true');
      setIsLocked(false);
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center font-sans selection:bg-app-accent selection:text-white">
        <div className="bg-app-bg p-8 rounded-2xl shadow-neu-flat w-full max-w-md animate-slideUp">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-app-bg text-app-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-btn">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-app-text">서비스 접속 암호</h3>
            <p className="text-app-textMuted mt-2 text-sm">앱에 접근하려면 비밀번호를 입력하세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="password" 
                value={input}
                onChange={(e) => setInput(e.target.value)} 
                placeholder="비밀번호 입력 (기본: 1234)"
                className="w-full bg-app-bg text-app-text px-4 py-3 rounded-xl shadow-neu-pressed focus:outline-none focus:ring-2 focus:ring-app-accent transition-all"
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={isChecking || !input}
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

  return <App />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <UserApp />
  </React.StrictMode>
);