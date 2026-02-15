import { FC } from 'react';

import { GaesupAdminProps } from './types';
import LoginPage from '../../pages/LoginPage';
import { useAuthStore } from '../../store/authStore';

const GaesupAdmin: FC<GaesupAdminProps> = ({ children, requireLogin = false }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (requireLogin && !isLoggedIn) {
    return <LoginPage />;
  }
  return <>{children}</>;
};

export default GaesupAdmin; 