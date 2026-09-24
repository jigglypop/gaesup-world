import type { NPCBrainDecision, NPCInstance, NPCObservation } from '../../../types';
import { sameNPCInstanceProps } from '../memo';

const base: NPCInstance = { id: 'a', templateId: 't', name: 'A', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
const onSelect = () => {};

test('decision bookkeeping does not re-render an NPC; rendered fields do', () => {
  const props = { instance: base, isEditMode: false, onSelect };
  const observed: NPCInstance = { ...base, lastObservation: { timestamp: 1 } as NPCObservation, lastDecision: { source: 'scripted', actions: [] } as NPCBrainDecision };
  expect(sameNPCInstanceProps(props, { ...props, instance: observed })).toBe(true);
  expect(sameNPCInstanceProps(props, { ...props, instance: { ...observed, currentAnimation: 'walk' } })).toBe(false);
  expect(sameNPCInstanceProps(props, { ...props, instance: { ...base, position: [1, 0, 0] } })).toBe(false);
  expect(sameNPCInstanceProps(props, { ...props, isEditMode: true })).toBe(false);
});
