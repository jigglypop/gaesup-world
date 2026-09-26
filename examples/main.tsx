import { lazy, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

// The room loads after the first paint, so three.js never blocks the initial UI chunk.
const Minihome = lazy(() => import('./minihome/Minihome'));

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <Suspense fallback={<p style={{ padding: 32 }}>작은 세상을 여는 중 · Opening your little world…</p>}>
      <Minihome />
    </Suspense>,
  );
