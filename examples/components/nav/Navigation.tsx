import React from 'react';

import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../../src/admin-entry';
import './styles.css';

export const Navigation = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className="app-navigation">
      <NavLink to="/" className="app-nav-brand">
        <span className="app-nav-mark">G</span>
        <span>Gaesup</span>
      </NavLink>
      <NavLink to="/edit" className="app-nav-button">
        에디터
      </NavLink>
      <NavLink to="/world" className="app-nav-button">
        월드
      </NavLink>
      <NavLink to="/blueprints" className="app-nav-button">
        블루프린트
      </NavLink>
      <NavLink to="/mini-room" className="app-nav-button">
        미니룸
      </NavLink>
      <NavLink to="/network" className="app-nav-button">
        Network
      </NavLink>
      {isLoggedIn ? (
        <>
          <NavLink to="/admin" className="app-nav-button">
            Admin
          </NavLink>
          <span className="app-nav-user">{user?.username}</span>
          <button className="app-nav-button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <NavLink to="/admin" className="app-nav-button">
          Login
        </NavLink>
      )}
    </nav>
  );
}; 
