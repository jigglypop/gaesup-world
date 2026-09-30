/** @jest-environment jsdom */
import type { NPCInstance } from '../../npc/types';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const npc = (overrides: Partial<NPCInstance> = {}): NPCInstance => ({
  id: 'one', templateId: 'lab', name: 'NPC', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], ...overrides,
});

test('an interaction stops a walking NPC, turns it to the player within a third of a second, then lets it go on', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    const state = runtime.npcStore.getState();
    state.addInstance(npc({ behavior: { mode: 'idle', speed: 1, turnSpeed: 2 } }));
    state.setNavigation('one', [[0, 0, 20]], 2);
    runtime.clockLoop.clock.stepTicks(30);
    const walked = runtime.npcSimulation.getPose('one')!.position[2];
    expect(walked).toBeGreaterThan(0.5);

    runtime.npcSimulation.greet('one', [5, 0, walked]);
    expect(runtime.npcSimulation.isAttending('one')).toBe(true);
    runtime.clockLoop.clock.stepTicks(20);
    const held = runtime.npcSimulation.getPose('one')!;
    expect(held.position[2]).toBeCloseTo(walked, 5);
    expect(held.rotation[1]).toBeCloseTo(Math.PI / 2, 2);

    runtime.clockLoop.clock.stepTicks(200);
    expect(runtime.npcSimulation.isAttending('one')).toBe(false);
    expect(runtime.npcSimulation.getPose('one')!.position[2]).toBeGreaterThan(walked + 1);
  } finally { await runtime.dispose(); }
});

test('standing NPCs gesture on a schedule every client draws alike', async () => {
  const run = async () => {
    const runtime = createGaesupRuntime(); await runtime.setup();
    try {
      runtime.npcStore.getState().addInstance(npc({ behavior: { mode: 'idle', speed: 1, gestures: { clips: ['wave', 'nod'], everySeconds: 4 } } }));
      const seen: string[] = [];
      let revision = runtime.npcSimulation.gestureRevision;
      for (let tick = 0; tick < 60 * 30; tick++) {
        runtime.clockLoop.clock.stepTicks();
        if (runtime.npcSimulation.gestureRevision === revision) continue;
        revision = runtime.npcSimulation.gestureRevision;
        const gesture = runtime.npcSimulation.getGesture('one')!;
        seen.push(`${gesture.clip}@${gesture.at.toFixed(2)}`);
      }
      return seen;
    } finally { await runtime.dispose(); }
  };
  const first = await run();
  expect(first.length).toBeGreaterThanOrEqual(5);
  expect(first.length).toBeLessThanOrEqual(10);
  expect(await run()).toEqual(first);
});

test('a pacing patrol walks back along its waypoints and rests at each end', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    const state = runtime.npcStore.getState();
    state.addInstance(npc({ brain: { mode: 'scripted' }, behavior: { mode: 'patrol', speed: 4, loop: false, pauseSeconds: 1, waitSeconds: 0.5, waypoints: [[0, 0, 0], [0, 0, 8]] } }));
    const farthest = { out: 0, back: Infinity };
    for (let tick = 0; tick < 60 * 12; tick++) {
      runtime.clockLoop.clock.stepTicks();
      const z = runtime.npcSimulation.getPose('one')!.position[2];
      farthest.out = Math.max(farthest.out, z);
      if (farthest.out > 7.9) farthest.back = Math.min(farthest.back, z);
    }
    expect(farthest.out).toBeCloseTo(8, 1);
    expect(farthest.back).toBeLessThan(1);
  } finally { await runtime.dispose(); }
});
