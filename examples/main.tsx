import { lazy, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const Page = location.pathname.slice(import.meta.env.BASE_URL.length).startsWith('engine')
  ? lazy(() => import('./engine/EngineShowcase'))
  : lazy(() => import('./minihome/Minihome'));

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <Suspense fallback={<p style={{ padding: 32 }}>작은 세상을 여는 중 · Opening your little world…</p>}>
      <Page />
    </Suspense>,
  );
