import React from 'react';

import { useAuthStore } from '../../../src/admin-entry';
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
        메인
      </a>
      <a href="/edit" className="app-nav-button">
        편집
      </a>
      <a href="/network" className="app-nav-button">
        멀티플레이
      </a>
      {isLoggedIn ? (
        <>
          <a href="/building" className="app-nav-button">
            Building
          </a>
          <a href="/blueprints" className="app-nav-button">
            Blueprint
          </a>
          <a href="/admin" className="app-nav-button">
            Admin
          </a>
          <span className="app-nav-user">{user?.username}</span>
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
