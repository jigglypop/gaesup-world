import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, createCatalogPlugin, createInventoryPlugin, GaesupRuntimeProvider, useCatalogTracker } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

async function catalogTracking(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime({ worldId: `catalog-lab-${crypto.randomUUID()}`, plugins: [createCatalogPlugin(), createInventoryPlugin()] });
  const root = createRoot(ctx.host);
  const originalSubscribe = runtime.inventoryStore.subscribe;
  let active = 0;
  runtime.inventoryStore.subscribe = listener => {
    active++; const off = originalSubscribe(listener); let released = false;
    return () => { if (!released) { released = true; active--; off(); } };
  };
  function Consumer() { useCatalogTracker(); return null; }
  const check = (id: string, expected: number, actual: number, scope: string) => { ctx.assert(id, expected, actual); ctx.sample(id, actual, 'count', scope); };
  try {
    await runtime.setup();
    flushSync(() => root.render(<GaesupRuntimeProvider runtime={runtime}><Consumer /><Consumer /></GaesupRuntimeProvider>));
    check('active-catalog-subscriptions', 1, active, 'two-real-hook-consumers');
    runtime.inventoryStore.getState().add('catalog-lab-item', 3);
    check('catalog-collection-overcount', 0, (runtime.catalogStore.getState().get('catalog-lab-item')?.totalCollected ?? 0) - 3, 'one-inventory-add-with-two-consumers');
    await runtime.save.save('main'); const before = runtime.catalogStore.getState().get('catalog-lab-item')!.totalCollected;
    runtime.inventoryStore.getState().clear(); await runtime.save.load('main');
    check('catalog-restore-overcount', 0, runtime.catalogStore.getState().get('catalog-lab-item')!.totalCollected - before, 'actual-indexeddb-restore-with-live-trackers');
    await runtime.dispose(); await nextFrame(ctx.signal);
    check('catalog-subscriptions-after-dispose', 0, active, 'mounted-hooks-owner-disposal');
    await runtime.setup(); await nextFrame(ctx.signal);
    runtime.inventoryStore.getState().add('catalog-lab-restart', 1);
    check('catalog-restart-overcount', 0, (runtime.catalogStore.getState().get('catalog-lab-restart')?.totalCollected ?? 0) - 1, 'mounted-hooks-owner-restart');
  } finally {
    flushSync(() => root.unmount()); await runtime.save.remove('main'); await runtime.dispose(); runtime.inventoryStore.subscribe = originalSubscribe;
  }
}

export const catalogScenarios: Scenario[] = [
  { id: 'catalog-tracking', title: '도감 구독·저장 복원 중복', description: '실제 도감 훅 두 개의 구독 수·수집 중복·IndexedDB 복원 중복·종료 후 잔여 구독을 계측합니다.', version: 1, requirementIds: ['R02', 'R25'], run: catalogTracking },
];
