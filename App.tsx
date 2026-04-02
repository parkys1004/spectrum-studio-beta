import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage'; // 실제 서비스 페이지

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* 여기 아래에 있는 모든 페이지는 비번을 쳐야 볼 수 있음 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<HomePage />} />
          {/* 추가 서비스 페이지들... */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
