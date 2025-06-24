import React from 'react';
import { useAuthStore } from '../../store/authStore';
import LoginPage from '../../pages/LoginPage';

// This UI will be overlaid on top of the world when logged in.
const AdminInfo: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: '60px',
    left: '10px',
    zIndex: 101,
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
    <div style={style}>
      <span>Welcome, {user?.username}</span>
      <button onClick={logout} style={buttonStyle}>Logout</button>
    </div>
  );
};


interface GaesupAdminProps {
  children: React.ReactNode;
}

const GaesupAdmin: React.FC<GaesupAdminProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <>
      <AdminInfo />
      {children}
    </>
  );
};

export default GaesupAdmin; 