import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider } from 'gaesup-world';
import { NetworkBridge, useNetworkBridge } from 'gaesup-world/network';

import type { Scenario, ScenarioContext } from './types';

async function worldNetworkClock(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  // Older builds expose only the shared bridge used by useNetworkBridge.
  const legacy = new NetworkBridge();
  const releases: (() => void)[] = [];
  const check = (id: string, expected: number, actual: number) => {
    ctx.sample(id, actual, 'count', 'actual-network-system-and-world-clock'); ctx.assert(id, expected, actual);
  };
  try {
    await a.setup(); await b.setup();
    const owned = (runtime: typeof a) => (runtime as typeof a & { networkBridge?: NetworkBridge }).networkBridge ?? legacy;
    const bridgeA = owned(a); const bridgeB = owned(b);
    bridgeA.ensureMainEngine(); bridgeB.ensureMainEngine();
    check('network-shared-world-engines', 0, Number(bridgeA.getEngine('main') === bridgeB.getEngine('main')));
    for (const rate of [30, 60, 144]) for (const consumers of [1, 2]) {
      let notices = 0;
      const off = bridgeA.subscribe(() => { notices++; });
      const controlled = bridgeA as NetworkBridge & { acquireUpdates?: (id: string, loop: typeof a.clockLoop) => () => void };
      const leases = Array.from({ length: consumers }, () => controlled.acquireUpdates?.('main', a.clockLoop) ?? (() => {}));
      releases.push(...leases);
      const before = a.clockLoop.clock.tick;
      a.clockLoop.suspend();
      for (let frame = 0; frame < rate; frame++) a.clockLoop.clock.advance(1 / rate);
      check(`network-ticks/${rate}Hz/${consumers}`, 60, a.clockLoop.clock.tick - before);
      check(`network-publications/${rate}Hz/${consumers}`, 30, notices);
      off(); leases.forEach(release => release());
    }
    const previousBridge = bridgeA;
    await a.dispose();
    check('network-engines-after-dispose', 0, previousBridge.getEngine('main') ? 1 : 0);
    check('network-systems-after-dispose', 1, a.clockLoop.clock.systemCount);
    check('network-other-world-stopped', 0, Number(!bridgeB.getSystemState()?.isRunning));
    await a.setup(); const restarted = owned(a); restarted.ensureMainEngine();
    check('network-reused-disposed-bridge', 0, Number(restarted === previousBridge));
    ctx.host.textContent = '네트워크: 월드 격리, 30/60/144Hz, 소비자 1/2개, 종료·재시작';
  } finally { releases.forEach(release => release()); legacy.dispose(); await a.dispose(); await b.dispose(); }
}

export const networkClockScenarios: Scenario[] = [
  { id: 'world-network-clock', title: '월드 clock과 네트워크 갱신', description: '실제 NetworkSystem을 고정 tick에 연결하고 중복 소비자·표시 주기·월드 종료의 갱신 횟수를 검사합니다.', version: 1, requirementIds: ['R25', 'R26'], run: worldNetworkClock },
  { id: 'world-network-consumers', title: '네트워크 훅 공유와 월드 재시작', description: '실제 Provider와 네트워크 훅을 유지한 채 표시 주기별 RAF 소유권·갱신·알림·개별 종료와 재시작을 검사합니다.', version: 1, requirementIds: ['R25', 'R26'], run: worldNetworkConsumers },
];

async function worldNetworkConsumers(ctx: ScenarioContext) {
  const request = window.requestAnimationFrame; const cancel = window.cancelAnimationFrame;
  const pending = new Map<number, FrameRequestCallback>(); let nextId = 0;
  window.requestAnimationFrame = callback => { pending.set(++nextId, callback); return nextId; };
  window.cancelAnimationFrame = id => { pending.delete(id); };
  const check = (id: string, expected: number, actual: number) => {
    ctx.sample(id, actual, 'count', 'real-provider-hooks-controlled-display-timestamps'); ctx.assert(id, expected, actual);
  };
  function Consumer() { const network = useNetworkBridge(); return <span>{network.isReady ? '연결됨' : '대기'}</span>; }
  try {
    for (const rate of [30, 60, 144]) {
      const a = createGaesupRuntime(); const b = createGaesupRuntime(); const root = createRoot(ctx.host);
      const render = () => flushSync(() => root.render(<>
        <GaesupRuntimeProvider runtime={a}><Consumer /><Consumer /></GaesupRuntimeProvider>
        <GaesupRuntimeProvider runtime={b}><Consumer /></GaesupRuntimeProvider>
      </>));
      const frame = (timestamp: number) => { const work = [...pending.values()]; pending.clear(); for (const callback of work) callback(timestamp); };
      try {
        await a.setup(); await b.setup(); render();
        await new Promise<void>(resolve => setTimeout(resolve, 0)); render();
        check(`network-hook-raf-owners/${rate}Hz`, 2, pending.size);
        let aNotices = 0; let bNotices = 0;
        const offA = a.networkBridge.subscribe(() => { aNotices++; }); const offB = b.networkBridge.subscribe(() => { bNotices++; });
        for (let i = 0; i <= rate; i++) frame(1000 + i * 1000 / rate);
        check(`network-hook-a-publications/${rate}Hz`, 30, aNotices);
        check(`network-hook-b-publications/${rate}Hz`, 30, bNotices);
        check(`network-hook-a-updates/${rate}Hz`, 30, a.networkBridge.getEngine('main')!.system.updateRevision);
        const oldA = a.networkBridge; await a.dispose(); render();
        check(`network-hook-owners-after-dispose/${rate}Hz`, 1, pending.size);
        for (let i = 1; i <= rate; i++) frame(2000 + i * 1000 / rate);
        check(`network-hook-b-survives/${rate}Hz`, 60, bNotices);
        check(`network-hook-old-a-stopped/${rate}Hz`, 30, aNotices);
        await a.setup(); render();
        await new Promise<void>(resolve => setTimeout(resolve, 0)); render();
        check(`network-hook-owners-after-restart/${rate}Hz`, 2, pending.size);
        check(`network-hook-old-engine-retained/${rate}Hz`, 0, Number(oldA.getEngine('main') !== undefined));
        for (let i = 0; i <= rate; i++) frame(3000 + i * 1000 / rate);
        check(`network-hook-restarted-updates/${rate}Hz`, 30, a.networkBridge.getEngine('main')!.system.updateRevision);
        offA(); offB();
      } finally { flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); }
      check(`network-hook-raf-after-unmount/${rate}Hz`, 0, pending.size);
    }
    ctx.host.textContent = '실제 훅: 월드별 RAF 1개 · 갱신/알림 초당 30회 · 개별 종료/재시작';
  } finally { window.requestAnimationFrame = request; window.cancelAnimationFrame = cancel; }
}
