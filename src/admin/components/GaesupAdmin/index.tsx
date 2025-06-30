import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
const AdminNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: '60px',
    left: '10px',
    zIndex: 1000,
    background: 'var(--editor-glass-bg, rgba(30, 30, 35, 0.6))',
    padding: 'var(--editor-spacing-sm, 8px)',
    borderRadius: 'var(--editor-border-radius, 6px)',
    border: '1px solid var(--editor-border-color, rgba(255, 255, 255, 0.1))',
    boxShadow: 'var(--editor-shadow, 0 8px 24px rgba(0,0,0,0.4))',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive 
      ? 'var(--editor-primary, rgba(0, 120, 212, 0.8))' 
      : 'var(--editor-surface-secondary, rgba(45, 45, 55, 0.7))',
    color: 'var(--editor-text-primary, #f1f1f1)',
    border: '1px solid var(--editor-border-color, rgba(255, 255, 255, 0.1))',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    minWidth: '80px',
    textAlign: 'center' as const
  });

  return (
    <div style={navStyle}>
      <button 
        onClick={() => navigate('/admin/world')}
        style={buttonStyle(location.pathname === '/admin/world')}
      >
        World
      </button>
      <button 
        onClick={() => navigate('/admin/room')}
        style={buttonStyle(location.pathname === '/admin/room')}
      >
        Room
      </button>
      <button 
        onClick={() => navigate('/admin/auth')}
        style={buttonStyle(location.pathname === '/admin/auth')}
      >
        Auth
      </button>
    </div>
  );
};

const AdminInfo: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
    <div style={style}>
      <span>Admin: {user?.username}</span>
      <button onClick={logout} style={buttonStyle}>Logout</button>
    </div>
  );
};

interface GaesupAdminProps {
  children?: React.ReactNode;
}

const GaesupAdmin: React.FC<GaesupAdminProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <>
      <AdminNav />
      {children}
      <AdminInfo />
    </>
  );
};

export default GaesupAdmin; 