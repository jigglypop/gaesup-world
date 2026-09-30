import type { NPCObservation } from '../../types';
import { createWanderTarget, npcDecisionPhase } from '../wander';

const observe = (instanceId: string, timestamp: number, home?: [number, number, number]): NPCObservation => ({
  instanceId, templateId: 't', timestamp, position: [5, 0, 5], rotation: [0, 0, 0], currentAnimation: 'idle',
  navigationState: 'none', behaviorMode: 'wander', brainMode: 'scripted', perceptionEnabled: false, perceived: [],
  ...(home ? { home } : {}),
});
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0]! - b[0]!, a[2]! - b[2]!);

test('NPCs whose ids share a length get different targets on the same tick', () => {
  const targets = Array.from({ length: 10 }, (_, index) => createWanderTarget(observe(`npc-${index}`, 12.5), 4).join());
  expect(new Set(targets).size).toBe(10);
});

test('every target stays within the radius around home, or the NPC when it has none', () => {
  for (let decision = 0; decision < 1000; decision++) {
    const around = distance(createWanderTarget(observe('npc-a', decision * 1.5, [-3, 0, 2]), 3), [-3, 0, 2]);
    expect(around).toBeGreaterThanOrEqual(3 * 0.35 - 1e-9);
    expect(around).toBeLessThanOrEqual(3 + 1e-9);
    expect(distance(createWanderTarget(observe('npc-a', decision * 1.5), 3), [5, 0, 5])).toBeLessThanOrEqual(3 + 1e-9);
  }
});

test('the same observation gives the same target and phase on every client', () => {
  expect(createWanderTarget(observe('npc-b', 7.25), 4)).toEqual(createWanderTarget(observe('npc-b', 7.25), 4));
  expect(npcDecisionPhase('npc-b')).toBe(npcDecisionPhase('npc-b'));
  expect(npcDecisionPhase('npc-b')).toBeGreaterThanOrEqual(0);
  expect(npcDecisionPhase('npc-b')).toBeLessThan(1);
});
