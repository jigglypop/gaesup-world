import React from 'react';

import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../../src/admin-entry';
import './styles.css';

export const Navigation = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const mainLinks = [
    { to: '/', label: '월드' },
    { to: '/edit', label: '에디터' },
  ];
  const extraLinks = [{ to: '/network', label: 'Network' }];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="app-navigation">
      <NavLink to="/" className="app-nav-brand">
        <span>GAESUP WORLD</span>
      </NavLink>
      <div className="app-nav-group" aria-label="Primary routes">
        {mainLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="app-nav-button">
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="app-nav-group app-nav-group--secondary" aria-label="Secondary routes">
        {extraLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="app-nav-button app-nav-button--subtle">
            {link.label}
          </NavLink>
        ))}
      </div>
      <div id="app-editor-navigation-slot" className="app-editor-navigation-slot" />
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
