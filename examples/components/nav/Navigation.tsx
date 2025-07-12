import React from 'react';
import { useAuthStore } from '../../../src/admin';
import './styles.css';

export const Navigation = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  
  return (
    <nav className="app-navigation">
      <a href="/" className="app-nav-button">
        Home
      </a>
      {isLoggedIn ? (
        <>
          <a href="/building" className="app-nav-button">
            Building Editor
          </a>
          <a href="/blueprints" className="app-nav-button">
            Blueprint Editor
          </a>
          <a href="/admin" className="app-nav-button">
            Admin Panel
          </a>
          <span className="app-nav-user">Welcome, {user?.username}</span>
          <button className="app-nav-button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <a href="/admin" className="app-nav-button">
          Login
        </a>
      )}
    </nav>
  );
}; 