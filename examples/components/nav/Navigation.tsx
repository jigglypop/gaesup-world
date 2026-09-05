import { useEffect, useLayoutEffect, useRef } from 'react';

import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from 'gaesup-world/admin';

import { DEVELOPER_ROUTES, PRODUCT_ROUTES } from '../../config/exampleRoutes';
import './styles.css';

const NAVIGATION_CONTENT_GAP = 8;
const MENU_ROUTES = DEVELOPER_ROUTES.filter((route) => route.category !== '호환');
const DEVELOPER_GROUPS = [...new Set(MENU_ROUTES.map((route) => route.category))].map(
  (category) => ({
    label: category === '개발자' ? '제작과 통합' : category,
    routes: MENU_ROUTES.filter((route) => route.category === category),
  }),
);

export const Navigation = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const developerMenuRef = useRef<HTMLDetailsElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const shell = navigation?.parentElement;
    if (!navigation || !shell) return;
    const previousHeight = shell.style.getPropertyValue('--app-header-height');
    const updateHeight = () => {
      const bottom = Math.ceil(navigation.getBoundingClientRect().bottom);
      shell.style.setProperty('--app-header-height', `${bottom + NAVIGATION_CONTENT_GAP}px`);
    };
    updateHeight();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHeight);
    observer?.observe(navigation);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateHeight);
      if (previousHeight) shell.style.setProperty('--app-header-height', previousHeight);
      else shell.style.removeProperty('--app-header-height');
    };
  }, []);
  const handleCloseMenu = () => {
    if (developerMenuRef.current) developerMenuRef.current.open = false;
  };
  useEffect(() => {
    if (developerMenuRef.current) developerMenuRef.current.open = false;
  }, [location.pathname]);
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const menu = developerMenuRef.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const menu = developerMenuRef.current;
      if (event.key !== 'Escape' || !menu?.open) return;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <nav ref={navigationRef} className="app-navigation" aria-label="주 메뉴">
      <NavLink to="/" className="app-nav-brand">
        개숲 월드
      </NavLink>
      <div className="app-nav-group" aria-label="체험 선택">
        {PRODUCT_ROUTES.map((route) => (
          <NavLink key={route.path} to={route.path} className="app-nav-button">
            {route.label}
          </NavLink>
        ))}
      </div>
      <details ref={developerMenuRef} className="app-nav-developer">
        <summary className="app-nav-button app-nav-button--subtle">개발자</summary>
        <div className="app-nav-developer__menu">
          {DEVELOPER_GROUPS.map((group) => (
            <section
              key={group.label}
              className="app-nav-developer__section"
              aria-label={group.label}
            >
              <h2>{group.label}</h2>
              <div className="app-nav-developer__links">
                {group.routes.map((route) => (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    className="app-nav-developer__link"
                    onClick={handleCloseMenu}
                  >
                    {route.label}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </div>
      </details>
      <div id="app-editor-navigation-slot" className="app-editor-navigation-slot" />
      {isLoggedIn && (
        <div className="app-nav-session">
          <span className="app-nav-user" title={user?.username}>{user?.username}</span>
          <button type="button" className="app-nav-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </nav>
  );
};
