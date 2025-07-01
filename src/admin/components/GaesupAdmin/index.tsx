import { FC } from 'react';
import { useAuthStore } from '../../store/authStore';
import LoginPage from '../../pages/LoginPage';
import { GaesupAdminProps } from './types';

const GaesupAdmin: FC<GaesupAdminProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  return <>{children}</>;
};

export default GaesupAdmin; 