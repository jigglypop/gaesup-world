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
      <NavLink to="/world" className="app-nav-button">
        World
      </NavLink>
      <NavLink to="/edit" className="app-nav-button">
        Editor
      </NavLink>
      <NavLink to="/building" className="app-nav-button">
        Building
      </NavLink>
      <NavLink to="/blueprints" className="app-nav-button">
        Blueprint
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
