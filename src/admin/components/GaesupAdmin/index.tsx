import { FC } from 'react';

import { GaesupAdminProps } from './types';
import LoginPage from '../../pages/LoginPage';
import { useAuthStore } from '../../store/authStore';

const GaesupAdmin: FC<GaesupAdminProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  return <>{children}</>;
};

export default GaesupAdmin; 