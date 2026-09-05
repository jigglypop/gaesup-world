import { act, fireEvent, render, screen } from '@testing-library/react';
import { getDialogRegistry, useDialogStore, useInventoryStore, useQuestStore } from 'gaesup-world';

import { NPCS } from '../../pages/world/data';
import { NPCBeacon } from '../npc/NPCBeacon';
import { registerSeedContent } from '../seedContent';

jest.mock('gaesup-world', () => ({
  ...jest.requireActual('gaesup-world'),
  useNpcSchedule: () => null,
  Interactable: ({ onActivate, label }: { onActivate: () => void; label: string }) =>
    <button onClick={onActivate}>{label}</button>,
}));

test('seeded residents open registered dialogue and Mei accepts quest wood through a choice', () => {
  registerSeedContent();
  for (const npc of NPCS) expect(getDialogRegistry().get(npc.dialogTreeId)).toBeDefined();
  const inventory = useInventoryStore.getState().serialize();
  const quests = useQuestStore.getState().serialize();
  const mei = NPCS.find((npc) => npc.id === 'mei')!;
  const view = render(<NPCBeacon {...mei} position={mei.pos} />);
  try {
    useInventoryStore.getState().clear();
    useQuestStore.setState({ state: {} });
    fireEvent.click(screen.getByRole('button', { name: '메이 대화' }));
    act(() => { useDialogStore.getState().choose(0); });
    expect(useQuestStore.getState().statusOf('q.intro.gather-wood')).toBe('active');
    useInventoryStore.getState().add('wood', 5);
    fireEvent.click(screen.getByRole('button', { name: '메이 대화' }));
    const choices = useDialogStore.getState().node?.choices ?? [];
    const deliveryIndex = choices.findIndex((choice) => choice.text === '목재 전달하기');
    expect(deliveryIndex).toBeGreaterThanOrEqual(0);
    act(() => { useDialogStore.getState().choose(deliveryIndex); });
    expect(useInventoryStore.getState().countOf('wood')).toBe(0);
    expect(useQuestStore.getState().isAllObjectivesComplete('q.intro.gather-wood')).toBe(true);
  } finally {
    view.unmount();
    useDialogStore.getState().close();
    useInventoryStore.getState().hydrate(inventory);
    useQuestStore.getState().hydrate(quests);
  }
});
