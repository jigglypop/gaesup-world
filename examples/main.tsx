import { lazy, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const Page = location.pathname.startsWith('/engine')
  ? lazy(() => import('./engine/EngineShowcase'))
  : lazy(() => import('./minihome/Minihome'));

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <Suspense fallback={<p style={{ padding: 32 }}>?? ?? ??? ?? ??</p>}>
      <Page />
    </Suspense>,
  );
