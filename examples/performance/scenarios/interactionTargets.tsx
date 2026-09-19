import { useState } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

import { createGaesupRuntime, GaesupRuntimeProvider, useInteractablesStore, useInteractionKey, ToolUseController, getItemRegistry, Interactable, InteractionTracker } from 'gaesup-world';

import { mountScene } from './scene';
import type { Scenario, ScenarioContext } from './types';

async function interactionTargets(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); const root = createRoot(ctx.host);
  const legacy = useInteractablesStore.getState();
  const views: Partial<Record<'a' | 'b', ReturnType<typeof useInteractablesStore.getState>>> = {};
  const hits = { a: 0, b: 0 }; const id = `target-${crypto.randomUUID()}`;
  function Consumer({ owner }: { owner: 'a' | 'b' }) {
    views[owner] = useInteractablesStore(state => state); useInteractionKey();
    return <p>월드 {owner}: {views[owner]?.current?.label ?? '선택 없음'}</p>;
  }
  const metric = (name: string, value: number) => { ctx.sample(name, value, 'count', 'actual-interaction-hooks-two-worlds-same-target-id'); ctx.assert(name, 0, value); };
  const register = (owner: 'a' | 'b') => views[owner]!.register({ id, kind: 'misc', label: owner, key: 'e', position: new THREE.Vector3(), range: 2, onActivate: () => { hits[owner]++; } });
  const select = (owner: 'a' | 'b', key = 'e', label = owner as string) => views[owner]!.setCurrent({ id, key, label, distance: 1 });
  try {
    await a.setup(); await b.setup();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer owner="a" /><Consumer owner="a" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer owner="b" /></GaesupRuntimeProvider></>));
    flushSync(() => { register('a'); register('b'); select('a'); select('b'); });
    flushSync(() => a.inputAdapter.updateKeyboard({ keyE: true }));
    metric('interaction-target-world-mismatches', Number(hits.a !== 1) + Number(hits.b !== 0));
    metric('interaction-duplicate-key-actions', Math.max(0, hits.a + hits.b - 1));
    flushSync(() => a.inputAdapter.updateKeyboard({ keyE: false }));
    flushSync(() => select('a', 'q', 'updated'));
    metric('interaction-stale-target-metadata', Number(views.a!.current?.key !== 'q') + Number(views.a!.current?.label !== 'updated'));
    flushSync(() => views.a!.unregister(id));
    metric('interaction-selected-removed-targets', Number(views.a!.current !== null));
    metric('interaction-other-world-target-loss', Number(!views.b!.entries.has(id)));
    flushSync(() => { register('a'); select('a'); });
    await a.dispose(); const before = hits.a;
    views.a!.activateCurrent(); metric('interaction-actions-after-dispose', hits.a - before);
    await a.setup(); flushSync(() => select('a')); views.a!.activateCurrent();
    metric('interaction-restart-mismatches', Number(hits.a !== before + 1));
  } finally {
    flushSync(() => root.unmount()); await a.dispose(); await b.dispose();
    useInteractablesStore.setState({ entries: legacy.entries, current: legacy.current });
  }
}

async function toolActions(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime(); const items = getItemRegistry(); const definitions = items.all(); const id = `tool-actions-${crypto.randomUUID()}`;
  let hits = 0; let setControllers: (count: number) => void = () => {};
  let scene: Awaited<ReturnType<typeof mountScene>> | undefined;
  const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: '#52c7b5' }));
  function Controllers() { const [count, setCount] = useState(2); setControllers = setCount; return <>{Array.from({ length: count }, (_, index) => <ToolUseController key={index} cooldownMs={0} />)}</>; }
  const metric = (name: string, value: number) => { ctx.sample(name, value, 'count', 'mounted-tool-controllers-dom-and-custom-backend-edges'); ctx.assert(name, 0, value); };
  try {
    await runtime.setup(); items.register({ id, name: id, icon: '', category: 'tool', stackable: false, maxStack: 1, toolKind: 'shovel' }); runtime.inventoryStore.getState().add(id);
    runtime.toolEvents.on('shovel', () => { hits++; });
    scene = await mountScene(ctx, [cube], false, <GaesupRuntimeProvider runtime={runtime}><Controllers /></GaesupRuntimeProvider>);
    await scene.frame(); await scene.frame();
    runtime.inputScope.dispatchKey('keydown', 'f'); runtime.inputScope.dispatchKey('keyup', 'f');
    metric('tool-duplicate-dom-actions', Math.abs(hits - 1));
    const before = hits; runtime.inputAdapter.updateKeyboard({ keyF: true }); runtime.inputAdapter.updateKeyboard({ keyF: false });
    metric('tool-custom-input-action-misses', Number(hits !== before + 1));
    flushSync(() => setControllers(1)); await scene.frame();
    const partial = hits; runtime.inputScope.dispatchKey('keydown', 'f'); runtime.inputScope.dispatchKey('keyup', 'f');
    metric('tool-partial-unmount-mismatches', Number(hits !== partial + 1));
    await runtime.dispose(); const stopped = hits; runtime.inputScope.dispatchKey('keydown', 'f'); runtime.inputAdapter.updateKeyboard({ keyF: true });
    metric('tool-actions-after-dispose', hits - stopped);
    await runtime.setup(); runtime.toolEvents.on('shovel', () => { hits++; }); await scene.frame();
    runtime.inputScope.dispatchKey('keydown', 'f'); runtime.inputScope.dispatchKey('keyup', 'f');
    metric('tool-action-restart-mismatches', Number(hits !== stopped + 1));
  } finally { scene?.dispose(); cube.geometry.dispose(); cube.material.dispose(); await runtime.dispose(); items.clear(); definitions.forEach(definition => items.register(definition)); }
}

async function worldTracking(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  let scene: Awaited<ReturnType<typeof mountScene>> | undefined; let parent: THREE.Group | null = null;
  let removeTarget: () => void = () => {}; let hits = 0;
  const activate = () => { hits++; };
  const metric = (name: string, value: number, expected = 0) => { ctx.sample(name, value, 'count', 'mounted-interactable-transformed-parent-two-worlds-two-trackers'); ctx.assert(name, expected, value); };
  function Target() {
    const [mounted, setMounted] = useState(true); removeTarget = () => setMounted(false); useInteractionKey();
    return <><InteractionTracker throttleMs={0} /><InteractionTracker throttleMs={0} /><group ref={value => { parent = value; }} position={[3, 0, 0]}>
      {mounted && <Interactable id="same" label="월드 A" position={[1, 0, 0]} range={1} onActivate={activate}>
        <mesh><boxGeometry /><meshStandardMaterial color="#52c7b5" /></mesh>
      </Interactable>}
    </group></>;
  }
  try {
    await a.setup(); await b.setup(); a.stateManager.getActiveState().position.set(4, 0, 0); b.stateManager.getActiveState().position.set(-4, 0, 0);
    scene = await mountScene(ctx, [], false, <>
      <GaesupRuntimeProvider runtime={a}><Target /></GaesupRuntimeProvider>
      <GaesupRuntimeProvider runtime={b}><InteractionTracker throttleMs={0} /><Interactable id="same" label="월드 B" position={[-4, 0, 0]} range={1} onActivate={activate}>
        <mesh><boxGeometry /><meshStandardMaterial color="#7a9bea" /></mesh>
      </Interactable></GaesupRuntimeProvider>
    </>);
    await scene.frame(); await scene.frame();
    metric('interaction-world-position-mismatches', Number(a.interactablesStore.getState().current?.distance !== 0) + Number(b.interactablesStore.getState().current?.distance !== 0));
    const before = a.interactablesStore.getState().getStats();
    for (let frame = 0; frame < 10; frame++) await scene.frame();
    const after = a.interactablesStore.getState().getStats();
    metric('interaction-tracker-scans-per-frame', (after.scans - before.scans) / 10, 1);
    metric('interaction-tracker-visits-per-frame', (after.visited - before.visited) / 10, 1);
    const group = parent as THREE.Group | null; if (!group) throw new Error('Interactable parent did not mount');
    group.position.x = 10; group.scale.x = 2;
    metric('interaction-stale-range-actions', Number(a.interactablesStore.getState().activateCurrent()));
    a.stateManager.getActiveState().position.set(12, 0, 0); await scene.frame();
    metric('interaction-moved-parent-mismatches', Number(a.interactablesStore.getState().current?.distance !== 0));
    a.inputAdapter.updateKeyboard({ keyE: true }); a.inputAdapter.updateKeyboard({ keyE: false });
    metric('interaction-tracked-action-mismatches', Number(hits !== 1));
    flushSync(removeTarget); await scene.frame();
    metric('interaction-component-cleanup-mismatches', Number(a.interactablesStore.getState().entries.size !== 0) + Number(a.interactablesStore.getState().current !== null) + Number(b.interactablesStore.getState().entries.size !== 1));
  } finally { scene?.dispose(); await a.dispose(); await b.dispose(); }
}

export const interactionTargetScenarios: Scenario[] = [
  { id: 'interaction-target-ownership', title: '상호작용 대상·명령 소유권', description: '두 월드의 같은 대상 ID와 중복 입력 훅, 대상 정보 변경·제거, 종료/재시작을 실제 store와 훅으로 검사합니다.', version: 1, requirementIds: ['R25'], run: interactionTargets },
  { id: 'tool-action-ownership', title: '도구 입력 단일 실행', description: '네이티브 렌더러에 마운트한 도구 controller 두 개에서 DOM·커스텀 backend 입력과 부분 제거·종료/재시작을 검사합니다.', version: 1, requirementIds: ['R25'], run: toolActions },
  { id: 'interaction-world-tracking', title: '상호작용 월드 좌표·중복 탐색', description: '부모 transform을 적용한 실제 대상과 중복 tracker를 마운트해 거리, 프레임당 탐색 수, 이동·제거를 검사합니다.', version: 1, requirementIds: ['R25'], run: worldTracking },
];
