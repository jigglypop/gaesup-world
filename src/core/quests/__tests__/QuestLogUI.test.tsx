import { act, fireEvent, render, screen } from '@testing-library/react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { QuestLogUI } from '../components/QuestLogUI';
import { getQuestRegistry } from '../registry/QuestRegistry';
import { useQuestStore } from '../stores/questStore';

test('delivery keeps collection progress visible and completion available', () => {
  getQuestRegistry().registerAll([{
    id: 'ui.collect-deliver', name: '목재 전달', summary: '목재 5개를 모아 메이에게 전달하세요.',
    objectives: [
      { id: 'collect', type: 'collect', itemId: 'wood', count: 5, description: '목재 수집' },
      { id: 'deliver', type: 'deliver', itemId: 'wood', npcId: 'mei', count: 5, description: '메이에게 전달' },
    ],
    rewards: [],
  }]);
  useInventoryStore.getState().clear();
  useQuestStore.setState({ state: {} });
  useQuestStore.getState().start('ui.collect-deliver');
  useInventoryStore.getState().add('wood', 5);
  render(<QuestLogUI />);
  fireEvent.keyDown(window, { key: 'j' });
  expect(screen.getByText('목재 수집 (5/5)')).toBeInTheDocument();
  expect(screen.getByText('메이에게 전달 (0/5)')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '완료 보고' })).not.toBeInTheDocument();
  act(() => { useQuestStore.getState().notifyDeliver('mei', 'wood', 5); });
  expect(useInventoryStore.getState().countOf('wood')).toBe(0);
  expect(screen.getByText('목재 수집 (5/5)')).toBeInTheDocument();
  expect(screen.getByText('메이에게 전달 (5/5)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '완료 보고' }));
  expect(screen.getByText('완료 (1)')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '완료 보고' })).not.toBeInTheDocument();
});
