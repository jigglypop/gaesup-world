import ReactThreeTestRenderer from '@react-three/test-renderer';

import { NPCSystem } from '..';
import { useBuildingStore } from '../../../../building/stores/buildingStore';
import { useNPCStore } from '../../../stores/npcStore';
import type { NPCInstance } from '../../../types';

const renders = new Map<string, number>();
jest.mock('../../NPCInstance', () => ({
  NPCInstance: ({ instance }: { instance: { id: string } }) => {
    renders.set(instance.id, (renders.get(instance.id) ?? 0) + 1);
    return null;
  },
}));
jest.mock('../../../hooks/useNPCSimulation', () => ({ useNPCSimulation: () => ({ getPose: () => undefined }) }));
jest.mock('../../../../navigation', () => ({
  applyNPCNavigationRoute: jest.fn(),
  useNavigationSystem: () => ({ init: async () => false }),
}));
jest.mock('../../../../building/components/BuildingNavigationObstacleDriver', () => ({ BuildingNavigationObstacleDriver: () => null }));

const npc = (id: string): NPCInstance => ({ id, templateId: 't', name: id, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });

test('a decision tick re-renders only the NPCs it changed, and never the list', async () => {
  useBuildingStore.setState({ editMode: 'npc' });
  const store = useNPCStore.getState();
  for (const id of ['a', 'b', 'c']) store.addInstance(npc(id));
  const view = await ReactThreeTestRenderer.create(<NPCSystem />);
  try {
    renders.clear();
    await ReactThreeTestRenderer.act(async () => {
      useNPCStore.getState().applyNPCDecisions([{ instanceId: 'b', observation: { timestamp: 1 } as NonNullable<NPCInstance['lastObservation']> }]);
    });
    expect([...renders]).toEqual([['b', 1]]);
    renders.clear();
    await ReactThreeTestRenderer.act(async () => { useNPCStore.getState().addInstance(npc('d')); });
    expect([...renders]).toEqual([['d', 1]]);
  } finally {
    await view.unmount();
    for (const id of ['a', 'b', 'c', 'd']) useNPCStore.getState().removeInstance(id);
    useBuildingStore.setState({ editMode: 'none' });
  }
});
