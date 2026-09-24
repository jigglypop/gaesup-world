import { lazy, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const route = location.pathname.slice(import.meta.env.BASE_URL.length);
const Page = route.startsWith('performance')
  ? lazy(() => import('./performance/PerformanceLab'))
  : route.startsWith('engine')
  ? lazy(() => import('./engine/EngineShowcase'))
  : route.startsWith('world')
  ? lazy(() => import('./world/PerfWorld'))
  : lazy(() => import('./minihome/Minihome'));

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <Suspense fallback={<p style={{ padding: 32 }}>작은 세상을 여는 중 · Opening your little world…</p>}>
      <Page />
    </Suspense>,
  );
