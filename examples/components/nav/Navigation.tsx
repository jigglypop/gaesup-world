import React from 'react';

import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from 'gaesup-world/admin';
import './styles.css';

export const Navigation = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const mainLinks = [
    { to: '/', label: '월드' },
    { to: '/edit', label: '에디터' },
    { to: '/edit/npc', label: 'NPC 에디터' },
  ];
  const extraLinks = [
    { to: '/minimal', label: '미니멀' },
    { to: '/network', label: '네트워크' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="app-navigation">
      <NavLink to="/" className="app-nav-brand">
        <span>GAESUP WORLD</span>
      </NavLink>
      <div className="app-nav-group" aria-label="주요 경로">
        {mainLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="app-nav-button">
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="app-nav-group app-nav-group--secondary" aria-label="보조 경로">
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
            관리자
          </NavLink>
          <span className="app-nav-user">{user?.username}</span>
          <button className="app-nav-button" onClick={handleLogout}>
            로그아웃
          </button>
        </>
      ) : (
        <NavLink to="/admin" className="app-nav-button">
          로그인
        </NavLink>
      )}
    </nav>
  );
};
