import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { registerSeedItems } from '../../items/data/items';
import { useWalletStore } from '../../economy/stores/walletStore';
import { getQuestRegistry } from '../registry/QuestRegistry';
import { useQuestStore } from '../stores/questStore';
import type { QuestDef } from '../types';

const Q_COLLECT: QuestDef = {
  id: 'q.test.collect',
  name: 'Collect Wood',
  summary: 'Collect 3 wood.',
  objectives: [{ id: 'o1', type: 'collect', itemId: 'wood', count: 3 }],
  rewards: [{ type: 'bells', amount: 50 }],
};

const Q_DELIVER: QuestDef = {
  id: 'q.test.deliver',
  name: 'Deliver Apples',
  summary: 'Deliver 2 apples to npc1.',
  objectives: [{ id: 'o1', type: 'deliver', npcId: 'npc1', itemId: 'apple', count: 2 }],
  rewards: [{ type: 'item', itemId: 'wood', count: 1 }],
};

beforeAll(() => {
  registerSeedItems();
  getQuestRegistry().clear();
  getQuestRegistry().registerAll([Q_COLLECT, Q_DELIVER]);
});

beforeEach(() => {
  useQuestStore.setState({ state: {} });
  useInventoryStore.setState({
    slots: new Array(useInventoryStore.getState().slots.length).fill(null),
  });
  useWalletStore.setState({ bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
});

describe('questStore', () => {
  test('start sets quest active', () => {
    const ok = useQuestStore.getState().start('q.test.collect');
    expect(ok).toBe(true);
    expect(useQuestStore.getState().statusOf('q.test.collect')).toBe('active');
  });

  test('collect quest auto-progresses with inventory', () => {
    useQuestStore.getState().start('q.test.collect');
    useInventoryStore.getState().add('wood', 3);
    useQuestStore.getState().recheck('q.test.collect');
    expect(useQuestStore.getState().isAllObjectivesComplete('q.test.collect')).toBe(true);
  });

  test('complete grants rewards', () => {
    useQuestStore.getState().start('q.test.collect');
    useInventoryStore.getState().add('wood', 3);
    useQuestStore.getState().recheck('q.test.collect');
    const ok = useQuestStore.getState().complete('q.test.collect');
    expect(ok).toBe(true);
    expect(useQuestStore.getState().statusOf('q.test.collect')).toBe('completed');
    expect(useWalletStore.getState().bells).toBe(50);
  });

  test('deliver requires inventory and consumes items', () => {
    useQuestStore.getState().start('q.test.deliver');
    useInventoryStore.getState().add('apple', 5);
    const success = useQuestStore.getState().notifyDeliver('npc1', 'apple', 5);
    expect(success).toBe(true);
    const all = useQuestStore.getState().isAllObjectivesComplete('q.test.deliver');
    expect(all).toBe(true);
  });

  test('serialize/hydrate roundtrip', () => {
    useQuestStore.getState().start('q.test.collect');
    const blob = useQuestStore.getState().serialize();
    useQuestStore.setState({ state: {} });
    useQuestStore.getState().hydrate(blob);
    expect(useQuestStore.getState().statusOf('q.test.collect')).toBe('active');
  });
});
