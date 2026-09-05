import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { registerSeedItems } from '../../items/data/items';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useWalletStore } from '../../economy/stores/walletStore';
import { getQuestRegistry } from '../registry/QuestRegistry';
import { describeObjectiveProgress } from '../components/QuestLogUI/helpers';
import { useQuestStore } from '../stores/questStore';
import type { QuestDef, QuestObjective, QuestSerialized } from '../types';

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
  test('releases the completion guard when reward delivery throws before changing state', () => {
    useInventoryStore.getState().add('wood', 3);
    useQuestStore.getState().start(Q_COLLECT.id);
    const add = jest.spyOn(useWalletStore.getState(), 'add').mockImplementationOnce(() => { throw new Error('delivery failed'); });
    try {
      expect(() => useQuestStore.getState().complete(Q_COLLECT.id)).toThrow('delivery failed');
      expect(useWalletStore.getState().bells).toBe(0);
      expect(useQuestStore.getState().statusOf(Q_COLLECT.id)).toBe('active');
    } finally {
      add.mockRestore();
    }
    expect(useQuestStore.getState().complete(Q_COLLECT.id)).toBe(true);
    expect(useWalletStore.getState().bells).toBe(50);
  });

  test.each(['wallet', 'inventory'] as const)('rejects reentrant completion from %s subscribers', (source) => {
    const id = `reentrant-${source}`;
    getQuestRegistry().register({ id, name: '보상', summary: '', objectives: [],
      rewards: [{ type: 'bells', amount: 100 }, { type: 'item', itemId: 'wood', count: 2 }] });
    useQuestStore.getState().start(id);
    const attempts: boolean[] = [];
    const listener = () => { attempts.push(useQuestStore.getState().complete(id)); };
    const unsubscribe = source === 'wallet' ? useWalletStore.subscribe(listener) : useInventoryStore.subscribe(listener);
    try {
      expect(useQuestStore.getState().complete(id)).toBe(true);
      expect(attempts).toEqual([false]);
      expect(useWalletStore.getState().bells).toBe(100);
      expect(useInventoryStore.getState().countOf('wood')).toBe(2);
      expect(useQuestStore.getState().statusOf(id)).toBe('completed');
    } finally {
      unsubscribe();
    }
  });

  test.each([
    { version: 2, state: {} }, { version: 1, state: [] },
    ...[
      { status: 'unknown' }, { questId: 'other' }, { startedAt: NaN }, { completedAt: -1 },
      { progress: [] }, { progress: { a: -1 } }, { progress: { a: 1.5 } }, { progress: { a: Infinity } },
    ].map((patch) => ({ version: 1, state: { custom: { questId: 'custom', status: 'active', progress: {}, ...patch } } })),
  ])('rejects corrupt saved progress before applying: %j', (data) => {
    const before = useQuestStore.getState();
    expect(() => before.hydrate(data as unknown as QuestSerialized)).toThrow(TypeError);
    expect(useQuestStore.getState()).toBe(before);
  });

  test('owns prepared custom objectives and retains empty and absent snapshot semantics', () => {
    const before = useQuestStore.getState();
    const data: QuestSerialized = { version: 1, state: { custom: {
      questId: 'custom', status: 'active', progress: { unknown: 3 }, startedAt: 0,
    } } };
    const apply = before.prepareHydrate(data);
    expect(useQuestStore.getState()).toBe(before);
    data.state.custom!.progress.unknown = 99;
    data.state.custom!.status = 'failed';
    apply();
    expect(useQuestStore.getState().state.custom).toEqual({ questId: 'custom', status: 'active', progress: { unknown: 3 }, startedAt: 0 });
    const current = useQuestStore.getState();
    current.hydrate(undefined);
    expect(useQuestStore.getState()).toBe(current);
    current.hydrate({ version: 1, state: {} });
    expect(useQuestStore.getState().state).toEqual({});
  });

  test.each(['talk', 'visit', 'flag'] as const)('%s updates all matching objectives once without mutating prior snapshots', (type) => {
    const objective: QuestObjective = type === 'talk' ? { id: 'a', type, npcId: 'npc1' }
      : type === 'visit' ? { id: 'a', type, tag: 'plaza' }
        : { id: 'a', type, key: 'gate', value: true };
    const first: QuestDef = { ...Q_COLLECT, id: `q.test.event.${type}`, objectives: [objective, { ...objective, id: 'b' }] };
    const second = { ...first, id: `${first.id}.second` };
    const abandoned = { ...first, id: `${first.id}.abandoned` };
    getQuestRegistry().registerAll([first, second, abandoned]);
    for (const quest of [first, second, abandoned, Q_COLLECT]) useQuestStore.getState().start(quest.id);
    useQuestStore.getState().abandon(abandoned.id);
    const previous = useQuestStore.getState().state;
    const listener = jest.fn();
    const off = useQuestStore.subscribe(listener);
    const notify = () => {
      const store = useQuestStore.getState();
      if (type === 'talk') store.notifyTalk('npc1');
      else if (type === 'visit') store.notifyVisit('plaza');
      else store.notifyFlag('gate', true);
    };
    try {
      notify();
      const current = useQuestStore.getState();
      for (const quest of [first, second]) {
        expect(current.progressOf(quest.id)?.progress).toEqual({ a: 1, b: 1 });
        expect(current.isAllObjectivesComplete(quest.id)).toBe(true);
        expect(previous[quest.id]?.progress).toEqual({ a: 0, b: 0 });
      }
      expect(current.state[abandoned.id]).toBe(previous[abandoned.id]);
      expect(current.state[Q_COLLECT.id]).toBe(previous[Q_COLLECT.id]);
      expect(listener).toHaveBeenCalledTimes(1);
      notify();
      expect(useQuestStore.getState()).toBe(current);
      expect(listener).toHaveBeenCalledTimes(1);
      const saved = current.serialize();
      current.hydrate(saved);
      expect(useQuestStore.getState().progressOf(first.id)?.progress).toEqual({ a: 1, b: 1 });
    } finally {
      off();
    }
  });

  test.each([false, true])('collect and delivery agree after partial delivery and reload (tracker: %s)', (tracking) => {
    const quest: QuestDef = {
      ...Q_COLLECT,
      id: `q.test.collect-deliver.${tracking}`,
      objectives: [
        { id: 'collect', type: 'collect', itemId: 'wood', count: 5 },
        { id: 'deliver', type: 'deliver', itemId: 'wood', npcId: 'npc1', count: 5 },
      ],
    };
    getQuestRegistry().registerAll([quest]);
    useQuestStore.getState().start(quest.id);
    const off = tracking ? useInventoryStore.subscribe(() => useQuestStore.getState().recheck(quest.id)) : () => {};
    try {
      useInventoryStore.getState().add('wood', 3);
      expect(useQuestStore.getState().notifyDeliver('npc1', 'wood', 3)).toBe(true);
      let progress = useQuestStore.getState().progressOf(quest.id)!;
      expect(describeObjectiveProgress(quest.objectives[0]!, progress).count).toBe(3);
      expect(useQuestStore.getState().isAllObjectivesComplete(quest.id)).toBe(false);
      useInventoryStore.getState().add('wood', 2);
      expect(useQuestStore.getState().notifyDeliver('npc1', 'wood', 2)).toBe(true);
      expect(useInventoryStore.getState().countOf('wood')).toBe(0);
      const saved = useQuestStore.getState().serialize();
      useQuestStore.setState({ state: {} });
      useQuestStore.getState().hydrate(saved);
      useQuestStore.getState().recheck(quest.id);
      progress = useQuestStore.getState().progressOf(quest.id)!;
      expect(progress.progress).toEqual({ collect: 5, deliver: 5 });
      expect(describeObjectiveProgress(quest.objectives[0]!, progress).count).toBe(5);
      expect(useQuestStore.getState().isAllObjectivesComplete(quest.id)).toBe(true);
      expect(useQuestStore.getState().complete(quest.id)).toBe(true);
      expect(useWalletStore.getState().bells).toBe(50);
    } finally {
      off();
    }
  });

  test('collect does not credit items spent elsewhere and unchanged rechecks do not publish', () => {
    useQuestStore.getState().start(Q_COLLECT.id);
    const initial = useQuestStore.getState();
    initial.recheck(Q_COLLECT.id);
    expect(useQuestStore.getState()).toBe(initial);
    useInventoryStore.getState().add('wood', 3);
    useQuestStore.getState().recheck(Q_COLLECT.id);
    expect(useQuestStore.getState().isAllObjectivesComplete(Q_COLLECT.id)).toBe(true);
    useInventoryStore.getState().removeById('wood', 1);
    useQuestStore.getState().recheck(Q_COLLECT.id);
    expect(useQuestStore.getState().isAllObjectivesComplete(Q_COLLECT.id)).toBe(false);
    const current = useQuestStore.getState();
    current.recheck(Q_COLLECT.id);
    expect(useQuestStore.getState()).toBe(current);
  });

  test('delivery shares one quantity budget across objectives and quests', () => {
    const first: QuestDef = {
      ...Q_DELIVER,
      id: 'q.test.multiple',
      objectives: [
        { id: 'a', type: 'deliver', npcId: 'npc1', itemId: 'apple', count: 2 },
        { id: 'b', type: 'deliver', npcId: 'npc1', itemId: 'apple', count: 2 },
      ],
    };
    getQuestRegistry().registerAll([first]);
    useQuestStore.getState().start(first.id);
    useQuestStore.getState().start(Q_DELIVER.id);
    useInventoryStore.getState().add('apple', 8);
    expect(useQuestStore.getState().notifyDeliver('npc1', 'apple', 3)).toBe(true);
    expect(useInventoryStore.getState().countOf('apple')).toBe(5);
    expect(useQuestStore.getState().progressOf(first.id)?.progress).toEqual({ a: 2, b: 1 });
    expect(useQuestStore.getState().progressOf(Q_DELIVER.id)?.progress.o1).toBe(0);
    expect(useQuestStore.getState().notifyDeliver('npc1', 'apple', 2)).toBe(true);
    expect(useInventoryStore.getState().countOf('apple')).toBe(3);
    expect(useQuestStore.getState().progressOf(first.id)?.progress).toEqual({ a: 2, b: 2 });
    expect(useQuestStore.getState().progressOf(Q_DELIVER.id)?.progress.o1).toBe(1);
  });

  test.each([0, -1, 0.5, NaN, Infinity])('rejects invalid delivery count %s without mutation', (count) => {
    useQuestStore.getState().start(Q_DELIVER.id);
    useInventoryStore.getState().add('apple', 5);
    const inventory = useInventoryStore.getState();
    const quests = useQuestStore.getState();
    expect(quests.notifyDeliver('npc1', 'apple', count)).toBe(false);
    expect(useInventoryStore.getState()).toBe(inventory);
    expect(useQuestStore.getState()).toBe(quests);
  });

  test('reserves space for all rewards and allows retry after saving', () => {
    const quest: QuestDef = {
      ...Q_COLLECT,
      id: 'q.test.reward-capacity',
      rewards: [
        { type: 'bells', amount: 50 },
        { type: 'item', itemId: 'reward-a', count: 1 },
        { type: 'item', itemId: 'reward-b', count: 1 },
      ],
    };
    getQuestRegistry().registerAll([quest]);
    useQuestStore.getState().start(quest.id);
    useInventoryStore.getState().add('wood', useInventoryStore.getState().slots.length);
    useInventoryStore.getState().remove(0);
    const inventory = useInventoryStore.getState();
    expect(useQuestStore.getState().complete(quest.id)).toBe(false);
    expect(useInventoryStore.getState()).toBe(inventory);
    expect(useWalletStore.getState().bells).toBe(0);
    expect(useQuestStore.getState().statusOf(quest.id)).toBe('active');
    const saved = useQuestStore.getState().serialize();
    useQuestStore.setState({ state: {} });
    useQuestStore.getState().hydrate(saved);
    useInventoryStore.getState().remove(1);
    expect(useQuestStore.getState().complete(quest.id)).toBe(true);
    expect(useInventoryStore.getState().countOf('reward-a')).toBe(1);
    expect(useInventoryStore.getState().countOf('reward-b')).toBe(1);
    expect(useWalletStore.getState().bells).toBe(50);
    expect(useQuestStore.getState().complete(quest.id)).toBe(false);
    expect(useWalletStore.getState().bells).toBe(50);
  });

  test('aggregates duplicate stackable rewards before checking existing stacks', () => {
    getItemRegistry().registerAll([
      { id: 'reward-stack', name: 'Reward', icon: '', category: 'material', stackable: true, maxStack: 10 },
    ]);
    const quest: QuestDef = {
      ...Q_COLLECT,
      id: 'q.test.reward-stack',
      rewards: [
        { type: 'item', itemId: 'reward-stack', count: 2 },
        { type: 'item', itemId: 'reward-stack', count: 2 },
      ],
    };
    getQuestRegistry().registerAll([quest]);
    useQuestStore.getState().start(quest.id);
    useInventoryStore.getState().add('reward-stack', 8);
    useInventoryStore.getState().add('wood', useInventoryStore.getState().slots.length - 1);
    expect(useQuestStore.getState().complete(quest.id)).toBe(false);
    expect(useInventoryStore.getState().countOf('reward-stack')).toBe(8);
    useInventoryStore.getState().remove(0, 2);
    expect(useQuestStore.getState().complete(quest.id)).toBe(true);
    expect(useInventoryStore.getState().countOf('reward-stack')).toBe(10);
  });

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

  test.each([false, true])('completion preserves surplus delivered items (reload: %s)', (reload) => {
    useQuestStore.getState().start(Q_DELIVER.id);
    useInventoryStore.getState().add('apple', 5);
    expect(useQuestStore.getState().notifyDeliver('npc1', 'apple', 1)).toBe(true);
    expect(useQuestStore.getState().complete(Q_DELIVER.id)).toBe(false);
    expect(useInventoryStore.getState().countOf('apple')).toBe(4);
    expect(useInventoryStore.getState().countOf('wood')).toBe(0);
    expect(useQuestStore.getState().notifyDeliver('npc1', 'apple', 1)).toBe(true);
    expect(useInventoryStore.getState().countOf('apple')).toBe(3);
    if (reload) {
      const saved = useQuestStore.getState().serialize();
      useQuestStore.setState({ state: {} });
      useQuestStore.getState().hydrate(saved);
    }
    expect(useQuestStore.getState().complete(Q_DELIVER.id)).toBe(true);
    expect(useInventoryStore.getState().countOf('apple')).toBe(3);
    expect(useInventoryStore.getState().countOf('wood')).toBe(1);
    expect(useQuestStore.getState().complete(Q_DELIVER.id)).toBe(false);
    expect(useInventoryStore.getState().countOf('apple')).toBe(3);
    expect(useInventoryStore.getState().countOf('wood')).toBe(1);
  });
});
