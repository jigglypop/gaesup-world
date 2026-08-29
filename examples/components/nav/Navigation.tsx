import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from 'gaesup-world/admin';

import { DEVELOPER_ROUTES, PRODUCT_ROUTES } from '../../config/exampleRoutes';
import './styles.css';

export const Navigation = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <nav className="app-navigation" aria-label="Gaesup World navigation">
      <NavLink to="/" className="app-nav-brand">
        GAESUP WORLD
      </NavLink>
      <div className="app-nav-group" aria-label="Product scenarios">
        {PRODUCT_ROUTES.map((route) => (
          <NavLink key={route.path} to={route.path} className="app-nav-button">
            {route.label}
          </NavLink>
        ))}
      </div>
      <details className="app-nav-developer">
        <summary className="app-nav-button app-nav-button--subtle">Developer</summary>
        <div className="app-nav-developer__menu">
          {DEVELOPER_ROUTES.map((route) => (
            <NavLink key={route.path} to={route.path} className="app-nav-developer__link">
              <strong>{route.label}</strong>
              <span>{route.category}</span>
            </NavLink>
          ))}
        </div>
      </details>
      <div id="app-editor-navigation-slot" className="app-editor-navigation-slot" />
      {isLoggedIn ? (
        <div className="app-nav-session">
          <span className="app-nav-user">{user?.username}</span>
          <button type="button" className="app-nav-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      ) : (
        <NavLink to="/admin" className="app-nav-button app-nav-button--subtle">
          Admin
        </NavLink>
      )}
    </nav>
  );
};
