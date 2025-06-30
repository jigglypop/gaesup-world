import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoginPage from '../../pages/LoginPage';
import { GaesupAdminProps } from './types';

const GaesupAdmin: React.FC<GaesupAdminProps> = ({ children }) => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const style: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    left: '10px',
    zIndex: 1000,
    background: 'var(--editor-glass-bg, rgba(30, 30, 35, 0.6))',
    padding: 'var(--editor-spacing-md, 12px)',
    borderRadius: 'var(--editor-border-radius, 6px)',
    color: 'var(--editor-text-primary, #f1f1f1)',
    border: '1px solid var(--editor-border-color, rgba(255, 255, 255, 0.1))',
    boxShadow: 'var(--editor-shadow, 0 8px 24px rgba(0,0,0,0.4))',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'var(--editor-surface-secondary, rgba(45, 45, 55, 0.7))',
    color: 'var(--editor-text-primary, #f1f1f1)',
    border: '1px solid var(--editor-border-color, rgba(255, 255, 255, 0.1))',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer'
  };

  return (
    <>
      <div style={style}>
        <span>Admin: {user?.username}</span>
        <button onClick={handleLogout} style={buttonStyle}>Logout</button>
      </div>
      {children}
    </>
  );
};

export default GaesupAdmin; 