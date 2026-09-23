import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, createMemoryInputBackend, createMotionsPlugin, GaesupRuntimeProvider, useInputBackend, useKeyboard, type InputAdapter, type InputStateListener } from 'gaesup-world';

import type { Scenario, ScenarioContext } from './types';

async function customInput(ctx: ScenarioContext) {
  const creates = { a: 0, b: 0 }; const ports: Partial<Record<'a0' | 'a1' | 'b', InputAdapter>> = {};
  const make = (owner: 'a' | 'b') => createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter: () => { creates[owner]++; return createMemoryInputBackend(); } })] });
  const a = make('a'); const b = make('b'); const root = createRoot(ctx.host);
  function Consumer({ id }: { id: 'a0' | 'a1' | 'b' }) { ports[id] = useInputBackend(); return <p>입력 소비자 {id}</p>; }
  const metric = (name: string, value: number) => { ctx.sample(name, value, 'count', 'real-custom-plugin-input-two-worlds-three-consumers'); ctx.assert(name, 0, value); };
  try {
    await a.setup(); await b.setup();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="a0" /><Consumer id="a1" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="b" /></GaesupRuntimeProvider></>));
    metric('input-factory-extra-instances', Math.abs(creates.a - 1) + Math.abs(creates.b - 1));
    metric('input-consumer-port-mismatches', Number(ports.a0 !== ports.a1) + Number(ports.a0 !== a.inputAdapter) + Number(ports.a0 !== a.motions.inputAdapter));
    flushSync(() => ports.a0!.updateKeyboard({ forward: true }));
    metric('input-store-projection-mismatches', Number(!a.store.getState().interaction.keyboard.forward) + Number(!ports.a1!.getKeyboard().forward));
    metric('input-cross-world-leaks', Number(ports.b!.getKeyboard().forward) + Number(b.store.getState().interaction.keyboard.forward));
    flushSync(() => a.store.getState().updateKeyboard({ keyF: true }));
    metric('input-store-command-mismatches', Number(!ports.a0!.getKeyboard().keyF));
    const old = ports.a0!;
    await a.dispose(); old.updateKeyboard({ keyZ: true });
    metric('input-state-after-dispose', Number(old.getKeyboard().forward) + Number(old.getKeyboard().keyZ) + Number(a.store.getState().interaction.keyboard.forward));
    await a.setup();
    flushSync(() => { a.inputAdapter.updateKeyboard({ rightward: true }); });
    metric('input-restart-mismatches', Number(ports.a0 !== old) + Number(!ports.a0!.getKeyboard().rightward) + Number(!a.store.getState().interaction.keyboard.rightward));
  } finally { flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); }
}

export const customInputScenarios: Scenario[] = [
  { id: 'world-custom-input', title: '커스텀 입력 단일 소유권', description: '실제 motion plugin의 커스텀 factory와 두 월드의 세 입력 소비자, store·motion 경로, 종료/재시작을 검사합니다.', version: 1, requirementIds: ['R25'], run: customInput },
  { id: 'world-input-source-lifecycle', title: '입력 소스 교체·구독 수명', description: '같은 월드의 키보드 훅 두 개와 실제 plugin 등록/해제·재시작에서 소스 구독, factory 생성, 오래된 알림과 키 해제를 검사합니다. 키 이벤트는 로컬에서 전달합니다.', version: 1, requirementIds: ['R25'], run: sourceLifecycle },
];

async function sourceLifecycle(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime(); const root = createRoot(ctx.host); const ports: InputAdapter[] = [];
  const sources: InputAdapter[] = []; let active = 0; let created = 0; let released = 0; let late: InputStateListener = () => {};
  function Consumer({ index }: { index: number }) { useKeyboard(); ports[index] = useInputBackend(); return <p>키보드 소비자 {index + 1}</p>; }
  const plugin = createMotionsPlugin({
    createInputAdapter: () => {
      created++; const source = createMemoryInputBackend(); const subscribe = source.subscribe!; sources.push(source);
      source.subscribe = listener => { active++; late = listener; const off = subscribe(listener); return () => { active--; off(); }; };
      return source;
    },
    disposeInputAdapter: () => { released++; },
  });
  const metric = (id: string, value: number) => { ctx.sample(id, value, 'count', 'actual-plugin-registry-and-mounted-keyboard-hooks'); ctx.assert(id, 0, value); };
  try {
    await runtime.setup();
    flushSync(() => root.render(<GaesupRuntimeProvider runtime={runtime}><Consumer index={0} /><Consumer index={1} /></GaesupRuntimeProvider>));
    const port = ports[0];
    runtime.plugins.register(plugin); await runtime.plugins.setup(plugin.id);
    metric('input-live-factory-mismatches', Math.abs(created - 1));
    metric('input-live-extra-source-subscriptions', Math.abs(active - 1));
    flushSync(() => runtime.inputScope.dispatchKey('keydown', 'w'));
    metric('input-live-keyboard-mismatches', Number(!sources[0]!.getKeyboard().forward) + Number(!runtime.store.getState().interaction.keyboard.forward));
    const oldCallback = late; const oldSource = sources[0]!;
    await runtime.plugins.dispose(plugin.id);
    oldCallback({ keyboard: { ...oldSource.getKeyboard(), forward: true }, mouse: oldSource.getMouse() });
    metric('input-source-after-removal', active + Number(runtime.inputAdapter.getKeyboard().forward));
    await runtime.plugins.setup(plugin.id);
    flushSync(() => runtime.inputScope.dispatchKey('keydown', 'w'));
    metric('input-held-key-rebind-mismatches', Number(!sources[1]!.getKeyboard().forward) + Number(ports[0] !== port));
    await runtime.dispose();
    metric('input-source-after-world-dispose', active + Number(runtime.inputAdapter.getKeyboard().forward) + Math.abs(released - 2));
    await runtime.setup(); flushSync(() => runtime.inputScope.dispatchKey('keydown', 'w'));
    metric('input-source-generation-mismatches', Math.abs(created - 3) + Math.abs(active - 1) + Number(ports[0] !== port) + Number(!runtime.inputAdapter.getKeyboard().forward));
  } finally { flushSync(() => root.unmount()); await runtime.dispose(); }
  metric('input-source-final-cleanup-mismatches', active + Math.abs(created - released));
}
