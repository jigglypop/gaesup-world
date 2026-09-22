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

test('one observation publication handles a whole decision batch', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    for (let i = 0; i < 100; i++) runtime.npcStore.getState().addInstance({ ...npc(String(i)), brain: { mode: 'scripted' } });
    const notify = jest.fn(); const off = runtime.npcStore.subscribe(notify);
    runtime.clockLoop.clock.stepTicks(60);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(Array.from(runtime.npcStore.getState().instances.values()).every(instance => instance.lastObservation?.timestamp === 1 / 60)).toBe(true);
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
    expect(observations[0]!.position[0]).toBeCloseTo(0.05);
    expect(observations[1]!.position[0]).toBeCloseTo(1.55);
    expect(observations[0]!.position[0]).toBeCloseTo(0.05); // No alias to the moving pose buffer.
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
