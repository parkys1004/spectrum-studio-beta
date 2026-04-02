import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuth = sessionStorage.getItem('app_auth');

  // 인증이 안 되어 있으면 로그인 페이지로 보냄
  return isAuth === 'true' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
