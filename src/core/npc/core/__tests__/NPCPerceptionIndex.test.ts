import type { NPCInstance } from '../../types';
import { createNPCObservation } from '../brain';
import { NPCPerceptionIndex } from '../NPCPerceptionIndex';

const npc = (id: string, position: [number, number, number]): NPCInstance => ({ id, templateId: 'lab', name: id, position, rotation: [0, 0, 0], scale: [1, 1, 1] });

test('spatial perception preserves linear results, equal-distance order, height, moves and removals', () => {
  const index = new NPCPerceptionIndex();
  const instances = new Map(Array.from({ length: 200 }, (_, i) => {
    const instance = npc(String(i), [(i % 20) * 8 - 80, (i % 3) * 10, Math.floor(i / 20) * 8 - 40]);
    return [instance.id, instance];
  }));
  for (const radius of [0, 16, 100, Infinity]) {
    index.refresh(instances);
    for (const original of instances.values()) {
      const instance = { ...original, perception: { enabled: true, sightRadius: radius, hearingRadius: 0 } };
      expect(index.observe(instance, 10)).toEqual(createNPCObservation(instance, instances, 10));
    }
    instances.delete('2'); instances.get('3')!.position = [0, 0, 0];
  }
  const extreme = npc('extreme', [1e20, 0, -1e20]); instances.set(extreme.id, extreme); index.refresh(instances);
  const observer = { ...extreme, perception: { enabled: true, sightRadius: 5, hearingRadius: 0 } };
  expect(index.observe(observer, 1)).toEqual(createNPCObservation(observer, instances, 1));
});
