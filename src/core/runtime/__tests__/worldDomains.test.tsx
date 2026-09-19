import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { createGaesupRuntime } from '../createGaesupRuntime';
import { GaesupRuntimeProvider } from '../context';
import { BuildingNavigationObstacleDriver } from '../../building/components/BuildingNavigationObstacleDriver';
import { BuildingRenderStateDriver } from '../../building/components/BuildingRenderStateDriver';
import { usePlacementPresets } from '../../building/stores/presets';
import { getNPCBrainBlueprint } from '../../npc/core/blueprint';
import { createNPCObservation, resolveNPCBrainDecision } from '../../npc/core/brain';
import { useNpcSchedule } from '../../npc/hooks/useNpcSchedule';
import type { NPCBrainBlueprint, NPCInstance } from '../../npc/types';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

test('mounted building drivers react to owned obstacle registration, replacement and runtime restart', async () => {
  const navigation = { cellSize: 1, worldMinX: -8, worldMinZ: -8, worldMaxX: 8, worldMaxZ: 8 };
  const a = createGaesupRuntime({ navigation }); const b = createGaesupRuntime({ navigation });
  await a.setup(); await b.setup(); await a.navigation.init(); await b.navigation.init();
  const view = render(<><GaesupRuntimeProvider runtime={a}><BuildingNavigationObstacleDriver navigation={a.navigation} /><BuildingRenderStateDriver /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><BuildingNavigationObstacleDriver navigation={b.navigation} /><BuildingRenderStateDriver /></GaesupRuntimeProvider></>);
  try {
    const obstacle = (x: number) => [{ id: 'same', x, z: 0, width: 2, depth: 2 }];
    let oldCleanup = () => {}; let cleanup = () => {};
    act(() => { oldCleanup = a.navigationObstacles.registerNavigationObstacles('same-source', obstacle(0)); });
    expect(a.navigation.isWalkable(0, 0)).toBe(false); expect(b.navigation.isWalkable(0, 0)).toBe(true);
    act(() => { cleanup = a.navigationObstacles.registerNavigationObstacles('same-source', obstacle(4)); oldCleanup(); });
    expect(a.navigation.isWalkable(0, 0)).toBe(true); expect(a.navigation.isWalkable(4, 0)).toBe(false);
    act(cleanup); expect(a.navigation.isWalkable(4, 0)).toBe(true);
    act(() => a.buildingStore.getState().hydrate({ blocks: [{ id: 'block', position: { x: 0, y: 0, z: 0 } }] }));
    expect(a.buildingRenderStore.getState().snapshot.ids).toEqual(['block']);
    expect(b.buildingRenderStore.getState().snapshot.ids).toEqual([]);
    await act(async () => { await a.dispose(); });
    expect(a.buildingRenderStore.getState().snapshot.ids).toEqual([]);
    await act(async () => { await a.setup(); await a.navigation.init(); });
    expect(a.buildingRenderStore.getState().snapshot.ids).toEqual(['block']);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('disposing a world destroys only its own GPU resources and clears its culling state', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  await a.setup(); await b.setup();
  const destroyA = jest.fn(); const destroyB = jest.fn();
  for (const [runtime, destroy] of [[a, destroyA], [b, destroyB]] as const) {
    runtime.buildingRenderStore.getState().setUploadResources(previous => ({ ...previous, spatialBuffer: { destroy } }));
    runtime.buildingCullingStore.getState().setResult({ version: 1, tileIds: new Set(), wallIds: new Set(), objectIds: new Set(), blockIds: new Set(['same']), clusterCounts: new Uint32Array([1]) });
  }
  await a.dispose();
  expect(destroyA).toHaveBeenCalledTimes(1); expect(destroyB).not.toHaveBeenCalled();
  expect(a.buildingCullingStore.getState().active).toBe(false); expect(b.buildingCullingStore.getState().active).toBe(true);
  await a.dispose(); expect(destroyA).toHaveBeenCalledTimes(1);
  await b.dispose(); expect(destroyB).toHaveBeenCalledTimes(1);
});

test('same-ID NPC blueprints resolve from the owning store without changing the legacy registry', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const blueprint = (text: string): NPCBrainBlueprint => ({ id: 'owned-brain', name: text, nodes: [
    { id: 'start', type: 'start' }, { id: 'speak', type: 'action', action: { type: 'speak', text } },
  ], edges: [{ id: 'edge', source: 'start', target: 'speak', branch: 'next' }] });
  const instance: NPCInstance = { id: 'same-npc', templateId: 'lab', name: 'NPC', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], brain: { mode: 'scripted', blueprintId: 'owned-brain' } };
  const original = getNPCBrainBlueprint('owned-brain');
  a.npcStore.getState().addBrainBlueprint(blueprint('A')); b.npcStore.getState().addBrainBlueprint(blueprint('B'));
  const observation = createNPCObservation(instance, new Map([[instance.id, instance]]), 0);
  expect(resolveNPCBrainDecision(instance, observation, a.npcStore.getState().brainBlueprints)?.actions).toEqual([{ type: 'speak', text: 'A' }]);
  expect(resolveNPCBrainDecision(instance, observation, b.npcStore.getState().brainBlueprints)?.actions).toEqual([{ type: 'speak', text: 'B' }]);
  expect(getNPCBrainBlueprint('owned-brain')).toBe(original);
  await a.dispose(); await b.dispose();
});

test('schedule changes and placement presets follow the current Provider across a world switch', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  let owner = a;
  const wrapper = ({ children }: { children: ReactNode }) => <GaesupRuntimeProvider runtime={owner}>{children}</GaesupRuntimeProvider>;
  const owned = renderHook(() => ({ slot: useNpcSchedule('same'), presets: usePlacementPresets() }), { wrapper });
  const presetsA = owned.result.current.presets;
  try {
    act(() => { a.npcScheduler.register({ npcId: 'same', entries: [], defaultEntry: { activity: 'work', position: [1, 0, 0] } }); b.npcScheduler.register({ npcId: 'same', entries: [], defaultEntry: { activity: 'sleep', position: [9, 0, 0] } }); });
    expect(owned.result.current.slot?.activity).toBe('work');
    act(() => { a.buildingStore.getState().setTileHeight(3); owned.result.current.presets.save('owned-preset'); a.buildingStore.getState().setTileHeight(0); owned.result.current.presets.apply('owned-preset'); });
    expect(a.buildingStore.getState().currentTileHeight).toBe(3); expect(b.buildingStore.getState().currentTileHeight).toBe(0);
    owner = b; owned.rerender();
    expect(owned.result.current.slot?.activity).toBe('sleep');
    act(() => a.npcScheduler.unregister('same')); expect(owned.result.current.slot?.activity).toBe('sleep');
    act(() => b.npcScheduler.unregister('same')); expect(owned.result.current.slot).toBeNull();
  } finally { act(() => presetsA.remove('owned-preset')); owned.unmount(); await a.dispose(); await b.dispose(); }
});
