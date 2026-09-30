import './main.css';

import { lazy, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

// The room loads after the first paint, so three.js never blocks the initial UI chunk.
const Minihome = lazy(() => import('./minihome/Minihome'));
const GiPage = lazy(() => import('./pages/GiPage').then((module) => ({ default: module.GiPage })));

function Loading() {
  return (
    <div className="gw-loading" role="status">
      <div className="gw-loading-card">
        <span className="gw-loading-island" aria-hidden>🏝️</span>
        <b>작은 세상을 여는 중</b>
        <small>Opening your little world…</small>
        <span className="gw-loading-bar" />
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <Suspense fallback={<Loading />}>
      {/* `/gi` under any base path is the dynamic GI showcase; everything else is the minihome. */}
      {/\/gi\/?$/.test(location.pathname) ? <GiPage /> : <Minihome />}
    </Suspense>,
  );
