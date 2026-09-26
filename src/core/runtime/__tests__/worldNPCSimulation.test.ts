/** @jest-environment jsdom */
import type { RapierRigidBody } from '@react-three/rapier';

import { createNPCPlugin, hydrateNPCState, serializeNPCState } from '../../npc/plugin';
import type { NPCInstance, NPCObservation } from '../../npc/types';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
const npc = (id = 'one'): NPCInstance => ({ id, templateId: 'lab', name: 'NPC', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test.each([30, 60, 144])('NPCs move without a renderer and publish no per-tick React changes at %i Hz', async rate => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const state = runtime.npcStore.getState(); state.addInstance(npc()); state.setNavigation('one', [[20, 0, 0]], 3);
  const notify = jest.fn(); const off = runtime.npcStore.subscribe(notify);
  try {
    expect(runtime.clockLoop.ownerCount).toBe(1);
    for (let i = 0; i < rate * 2; i++) runtime.clockLoop.clock.advance(1 / rate);
    expect(runtime.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6, 10);
    expect(notify).not.toHaveBeenCalled();
    // Persistence reads the live pose even between waypoints, without requiring mounted NPC views.
    const saved = serializeNPCState(runtime.npcStore); expect(saved.instances[0]!.position[0]).toBeCloseTo(6, 10);
    saved.instances[0]!.position[0] = 100;
    expect(runtime.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6, 10);
    runtime.clockLoop.clock.stepTicks(280);
    expect(runtime.npcSimulation.getPose('one')!.position).toEqual([20, 0, 0]);
    expect(runtime.npcStore.getState().instances.get('one')!.navigation?.state).toBe('arrived');
  } finally { off(); await runtime.dispose(); }
  expect(runtime.clockLoop.consumerCount).toBe(0); expect(runtime.clockLoop.clock.systemCount).toBe(1);
});

test('distance budget crosses multiple 3D waypoints in one tick', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    runtime.npcStore.getState().addInstance(npc());
    runtime.npcStore.getState().setNavigation('one', [[0, 0, 0], [0, 0.5, 0], [0, 1, 0], [1, 1, 0]], 120);
    runtime.clockLoop.clock.stepTicks();
    expect(runtime.npcSimulation.getPose('one')!.position).toEqual([1, 1, 0]);
    expect(runtime.npcStore.getState().instances.get('one')!.navigation).toMatchObject({ currentIndex: 4, state: 'arrived' });
  } finally { await runtime.dispose(); }
});

test('each decision tick publishes its whole batch of observations once', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    for (let i = 0; i < 100; i++) runtime.npcStore.getState().addInstance({ ...npc(String(i)), brain: { mode: 'scripted' } });
    const ticks: number[] = []; const off = runtime.npcStore.subscribe(() => ticks.push(runtime.clockLoop.clock.tick));
    // A 1 s interval puts every first decision within 62 ticks, spread over them rather than on one.
    runtime.clockLoop.clock.stepTicks(62);
    expect(Array.from(runtime.npcStore.getState().instances.values()).every(instance => instance.lastObservation)).toBe(true);
    expect(new Set(ticks).size).toBe(ticks.length);
    expect(ticks.length).toBeGreaterThan(30);
    off();
  } finally { await runtime.dispose(); }
});

test('AI uses live positions at a fixed cadence even when its memory changes', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const observations: NPCObservation[] = [];
  runtime.npcBrainAdapters.register('scripted', 'test', ({ observation }) => {
    observations.push(observation);
    return { source: 'scripted', actions: [{ type: 'remember', key: 'last', value: observation.timestamp }], reason: 'test' };
  });
  try {
    runtime.npcStore.getState().addInstance({ ...npc(), brain: { mode: 'scripted', policyId: 'test' }, behavior: { mode: 'idle', speed: 3, waitSeconds: 0.5 } });
    runtime.npcStore.getState().setNavigation('one', [[20, 0, 0]], 3);
    runtime.clockLoop.clock.stepTicks(60);
    expect(observations).toHaveLength(2);
    const [first, second] = observations as [NPCObservation, NPCObservation];
    const firstX = first.position[0];
    expect(second.timestamp - first.timestamp).toBeCloseTo(0.5);
    expect(firstX).toBeCloseTo(first.timestamp * 3);
    expect(second.position[0] - firstX).toBeCloseTo(1.5);
    expect(first.position[0]).toBe(firstX); // No alias to the moving pose buffer.
  } finally { await runtime.dispose(); }
});

test('remount binds the current pose, restore replaces it, and disposal isolates another world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  try {
    for (const runtime of [a, b]) { runtime.npcStore.getState().addInstance(npc()); runtime.npcStore.getState().setNavigation('one', [[20, 0, 0]], 3); runtime.clockLoop.clock.stepTicks(60); }
    const body = { isValid: () => true, setTranslation: jest.fn(), setRotation: jest.fn(), isKinematic: () => true, setNextKinematicTranslation: jest.fn(), setNextKinematicRotation: jest.fn() };
    const detach = a.npcSimulation.bindBody('one', body as unknown as RapierRigidBody);
    expect(body.setTranslation.mock.calls[0]![0].x).toBeCloseTo(3);
    detach(); a.clockLoop.clock.stepTicks(60);
    const detachAgain = a.npcSimulation.bindBody('one', body as unknown as RapierRigidBody);
    expect(body.setTranslation.mock.calls.at(-1)![0].x).toBeCloseTo(6); detachAgain();
    const saved = serializeNPCState(a.npcStore); a.clockLoop.clock.stepTicks(60); hydrateNPCState(saved, a.npcStore);
    expect(a.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6);
    a.clockLoop.clock.stepTicks(); expect(a.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6.05);
    await a.dispose(); a.clockLoop.clock.stepTicks(60); b.clockLoop.clock.stepTicks(60);
    expect(a.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6.05);
    expect(b.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6);
    await a.setup(); a.clockLoop.clock.stepTicks(); expect(a.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(6.1);
  } finally { await a.dispose(); await b.dispose(); }
});

test('save restore blocks reentrant simulation and resumes the restored live pose', async () => {
  const runtime = createGaesupRuntime({ plugins: [createNPCPlugin()] }); await runtime.setup();
  let off = () => {};
  try {
    runtime.npcStore.getState().addInstance(npc()); runtime.npcStore.getState().setNavigation('one', [[20, 0, 0]], 3);
    runtime.clockLoop.clock.stepTicks(60); const saved = runtime.save.createBlob();
    runtime.clockLoop.clock.stepTicks(60);
    let reentries = 0;
    off = runtime.npcStore.subscribe(() => { if (runtime.save.isRestoring()) { reentries++; runtime.clockLoop.clock.stepTicks(30); } });
    expect(runtime.save.hydrateBlob(saved)).toBe(true);
    expect(reentries).toBeGreaterThan(0); expect(runtime.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(3);
    runtime.clockLoop.clock.stepTicks(); expect(runtime.npcSimulation.getPose('one')!.position[0]).toBeCloseTo(3.05);
    expect(runtime.clockLoop.ownerCount).toBe(1);
    runtime.npcStore.getState().removeInstance('one'); expect(runtime.clockLoop.consumerCount).toBe(0);
    expect(runtime.npcSimulation.getPose('one')).toBeUndefined();
  } finally { off(); await runtime.dispose(); }
});

test('each decision tick with actions for many NPCs is one store update', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  runtime.npcBrainAdapters.register('scripted', 'look', ({ observation }) => ({
    source: 'scripted',
    actions: [{ type: 'lookAt', target: [1, 0, 1] }, { type: 'remember', key: 'seen', value: observation.perceived.length }],
  }));
  try {
    for (let i = 0; i < 50; i++) {
      runtime.npcStore.getState().addInstance({ ...npc(String(i)), brain: { mode: 'scripted', policyId: 'look' } });
    }
    const ticks: number[] = []; const off = runtime.npcStore.subscribe(() => ticks.push(runtime.clockLoop.clock.tick));
    runtime.clockLoop.clock.stepTicks(62);
    off();
    expect(new Set(ticks).size).toBe(ticks.length);
    const instance = runtime.npcStore.getState().instances.get('7')!;
    expect(instance.lastDecision?.actions).toHaveLength(2);
    expect(instance.rotation[1]).toBeCloseTo(Math.PI / 4);
    expect(instance.brain?.memory?.['seen']).toBeDefined();
  } finally { await runtime.dispose(); }
});

test('kinematic bodies are written only while their NPC moves', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    runtime.npcStore.getState().addInstance(npc());
    const body = { isValid: () => true, setTranslation: jest.fn(), setRotation: jest.fn(), isKinematic: () => true, setNextKinematicTranslation: jest.fn(), setNextKinematicRotation: jest.fn() };
    const detach = runtime.npcSimulation.bindBody('one', body as unknown as RapierRigidBody);
    runtime.clockLoop.clock.stepTicks(60);
    expect(body.setNextKinematicTranslation.mock.calls.length).toBeLessThanOrEqual(1);
    runtime.npcStore.getState().setNavigation('one', [[1, 0, 0]], 3);
    body.setNextKinematicTranslation.mockClear();
    runtime.clockLoop.clock.stepTicks(60);
    // 1m at 3m/s is 20 ticks of motion; the stopped NPC is not rewritten for the remaining 40.
    expect(body.setNextKinematicTranslation).toHaveBeenCalledTimes(20);
    expect(body.setNextKinematicTranslation.mock.calls.at(-1)![0].x).toBeCloseTo(1);
    detach();
  } finally { await runtime.dispose(); }
});

test('the NPC save revision advances while a pose moves and holds while it rests', async () => {
  const runtime = createGaesupRuntime({ plugins: [createNPCPlugin()] }); await runtime.setup();
  try {
    const state = runtime.npcStore.getState(); state.addInstance(npc()); state.setNavigation('one', [[1, 0, 0]], 3);
    const binding = [...runtime.save.getBindings()].find((entry) => entry.key === 'npc')!;
    const before = binding.revision!();
    // Moving poses change no store state, so only the simulation's revision can mark them dirty.
    runtime.clockLoop.clock.stepTicks(5);
    expect(binding.revision!()).not.toBe(before);
    runtime.clockLoop.clock.stepTicks(120);
    const rested = binding.revision!();
    runtime.clockLoop.clock.stepTicks(60);
    expect(binding.revision!()).toBe(rested);
  } finally { await runtime.dispose(); }
});

describe('NPC routes on the navigation grid', () => {
  async function routedWorld(route: [number, number, number][]) {
    const runtime = createGaesupRuntime(); await runtime.setup();
    Object.defineProperty(runtime.navigation, 'isReady', { get: () => true });
    jest.spyOn(runtime.navigation, 'findPath').mockReturnValue(route);
    jest.spyOn(runtime.navigation, 'smoothPath').mockImplementation((path) => path);
    runtime.npcStore.getState().addInstance(npc());
    runtime.npcStore.getState().setNavigation('one', [[6, 0, 6]], 3);
    return { runtime, at: () => runtime.npcSimulation.getPose('one')!.position };
  }

  test('an NPC walks the route around a wall instead of cutting straight through it', async () => {
    const { runtime, at } = await routedWorld([[0, 0, 0], [0, 0, 6], [6, 0, 6]]);
    try {
      runtime.clockLoop.clock.stepTicks(120);
      expect(at()[0]).toBeCloseTo(0);
      expect(at()[2]).toBeCloseTo(6);
      runtime.clockLoop.clock.stepTicks(180);
      expect(at()[0]).toBeCloseTo(6);
      expect(runtime.npcStore.getState().instances.get('one')!.navigation?.state).toBe('arrived');
    } finally { await runtime.dispose(); }
  });

  test('an NPC skips a waypoint the grid cannot reach instead of walking through walls', async () => {
    const { runtime, at } = await routedWorld([]);
    try {
      runtime.clockLoop.clock.stepTicks(60);
      expect(at()).toEqual([0, 0, 0]);
      expect(runtime.npcStore.getState().instances.get('one')!.navigation?.state).toBe('arrived');
    } finally { await runtime.dispose(); }
  });
});

describe('NPC wandering', () => {
  test('30 NPCs sharing a decision interval spread their decisions across ticks', async () => {
    const runtime = createGaesupRuntime(); await runtime.setup();
    const perTick = new Map<number, number>();
    runtime.npcBrainAdapters.register('scripted', 'count', ({ observation }) => {
      perTick.set(observation.timestamp, (perTick.get(observation.timestamp) ?? 0) + 1);
      return undefined;
    });
    try {
      for (let i = 0; i < 30; i++) runtime.npcStore.getState().addInstance({ ...npc(`npc-${i}`), brain: { mode: 'scripted', policyId: 'count' } });
      runtime.clockLoop.clock.stepTicks(120);
      expect([...perTick.values()].reduce((sum, count) => sum + count, 0)).toBeGreaterThanOrEqual(30);
      expect(Math.max(...perTick.values())).toBeLessThanOrEqual(4);
    } finally { await runtime.dispose(); }
  });

  test.each([
    ['its home', [8, 0, -4] as [number, number, number]],
    ['where it was placed', undefined],
  ])('a wandering NPC stays around %s after 1,000 decisions', async (_, home) => {
    const runtime = createGaesupRuntime(); await runtime.setup();
    const center = home ?? [0, 0, 0];
    try {
      runtime.npcStore.getState().addInstance({
        ...npc(), brain: { mode: 'scripted' },
        behavior: { mode: 'wander', speed: 30, wanderRadius: 3, waitSeconds: 0.5, ...(home ? { home } : {}) },
      });
      // Walking in from the placement point takes under a second at this speed.
      runtime.clockLoop.clock.stepTicks(120);
      let farthest = 0;
      for (let decision = 0; decision < 1000; decision++) {
        runtime.clockLoop.clock.stepTicks(30);
        const [x, , z] = runtime.npcSimulation.getPose('one')!.position;
        farthest = Math.max(farthest, Math.hypot(x - center[0], z - center[2]));
      }
      expect(farthest).toBeLessThanOrEqual(3 + 1e-6);
      expect(farthest).toBeGreaterThan(1);
    } finally { await runtime.dispose(); }
  });
});
