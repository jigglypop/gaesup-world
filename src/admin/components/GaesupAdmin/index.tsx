import { FC, useEffect } from 'react';

import { GaesupAdminProps } from './types';
import LoginPage from '../../pages/LoginPage';
import { useAuthStore } from '../../store/authStore';

const GaesupAdmin: FC<GaesupAdminProps> = ({ children, requireLogin = true, requiredRoles }) => {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const verify = useAuthStore((state) => state.verify);

  useEffect(() => {
    if (requireLogin && status === 'unknown') void verify();
  }, [requireLogin, status, verify]);

  if (!requireLogin) return <>{children}</>;
  if (status === 'unknown' || (status === 'checking' && !user)) {
    return <div className="login-container" role="status">세션 확인 중...</div>;
  }
  if (status !== 'authenticated' || !user) return <LoginPage />;
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.some((role) => user.roles.includes(role))) {
    return <LoginPage notice="이 화면에 접근할 권한이 없습니다." />;
  }
  return <>{children}</>;
};

export default GaesupAdmin;
