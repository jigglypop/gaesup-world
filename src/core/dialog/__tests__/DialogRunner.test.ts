import { registerSeedItems } from '../../items/data/items';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useWalletStore } from '../../economy/stores/walletStore';
import { DialogRunner } from '../core/DialogRunner';
import type { DialogRuntimeAdapter, DialogTree } from '../types';

beforeAll(() => { registerSeedItems(); });

beforeEach(() => {
  useInventoryStore.getState().clear();
  useWalletStore.getState().set(0);
});

const TREE: DialogTree = {
  id: 'test',
  startId: 'a',
  nodes: {
    a: { id: 'a', text: 'hi', choices: [
      { text: 'gift', next: 'b', effects: [{ type: 'giveItem', itemId: 'apple', count: 2 }] },
      { text: 'bell', next: 'c', effects: [{ type: 'giveBells', amount: 50 }] },
      { text: 'gated', next: 'd', condition: { type: 'hasItem', itemId: 'wood', count: 1 } },
    ] },
    b: { id: 'b', text: 'thanks', next: null },
    c: { id: 'c', text: 'cash', next: null },
    d: { id: 'd', text: 'rare', next: null },
  },
};

const TEST_ADAPTER: DialogRuntimeAdapter = {
  countItem: (itemId) => useInventoryStore.getState().countOf(itemId),
  addItem: (itemId, count) => useInventoryStore.getState().add(itemId, count),
  removeItem: (itemId, count) => useInventoryStore.getState().removeById(itemId, count),
  getItemName: (itemId) => itemId,
  getBells: () => useWalletStore.getState().bells,
  addBells: (amount) => useWalletStore.getState().add(amount),
  spendBells: (amount) => useWalletStore.getState().spend(amount),
  getFriendshipScore: () => 0,
  addFriendship: () => undefined,
  getDay: () => 0,
  notifyFlag: () => undefined,
  startQuest: () => undefined,
  completeQuest: () => undefined,
  notify: () => undefined,
};

describe('DialogRunner', () => {
  test.each(['advance', 'choose'] as const)('%s rejects reward callback reentry and keeps the intended destination', (action) => {
    const tree: DialogTree = { id: 'reentry', startId: 'a', nodes: {
      a: { id: 'a', text: '', ...(action === 'advance'
        ? { effects: [{ type: 'giveBells' as const, amount: 50 }], next: 'b' }
        : { choices: [{ text: 'reward', effects: [{ type: 'giveBells' as const, amount: 50 }], next: 'b' }] }) },
      b: { id: 'b', text: 'done', next: null },
    } };
    const runner = new DialogRunner({ tree, adapter: TEST_ADAPTER });
    let callbacks = 0;
    const off = useWalletStore.subscribe(() => {
      callbacks++;
      if (callbacks > 1) throw new Error('duplicate payout');
      runner.advance();
      runner.choose(0);
    });
    try {
      if (action === 'advance') runner.advance();
      else runner.choose(0);
      expect(useWalletStore.getState().bells).toBe(50);
      expect(callbacks).toBe(1);
      expect(runner.current?.id).toBe('b');
      expect(runner.advance()).toBeNull();
    } finally {
      off();
    }
  });

  test('advance cannot repeatedly execute effects on a node awaiting a choice', () => {
    const runner = new DialogRunner({ adapter: TEST_ADAPTER, tree: { id: 'choice', startId: 'a', nodes: {
      a: { id: 'a', text: '', effects: [{ type: 'giveBells', amount: 50 }], choices: [{ text: 'leave', next: null }] },
    } } });
    runner.advance();
    runner.advance();
    expect(useWalletStore.getState().bells).toBe(0);
    expect(runner.current?.id).toBe('a');
    expect(runner.choose(0)).toBeNull();
  });

  test('아이템 지급 효과가 인벤토리를 채우고 대화를 종료한다', () => {
    const r = new DialogRunner({ tree: TREE, adapter: TEST_ADAPTER });
    expect(r.current?.id).toBe('a');
    r.choose(0);
    expect(useInventoryStore.getState().countOf('apple')).toBe(2);
    expect(r.current?.id).toBe('b');
    r.advance();
    expect(r.isFinished()).toBe(true);
  });

  test('벨 지급 효과가 지갑을 갱신한다', () => {
    const r = new DialogRunner({ tree: TREE, adapter: TEST_ADAPTER });
    r.choose(1);
    expect(useWalletStore.getState().bells).toBe(50);
    expect(r.current?.id).toBe('c');
  });

  test('조건을 만족하지 않으면 선택지를 숨긴다', () => {
    const r = new DialogRunner({ tree: TREE, adapter: TEST_ADAPTER });
    expect(r.visibleChoices().length).toBe(2);
    useInventoryStore.getState().add('wood', 1);
    const r2 = new DialogRunner({ tree: TREE, adapter: TEST_ADAPTER });
    expect(r2.visibleChoices().length).toBe(3);
  });

  test('상점 열기 효과가 콜백을 호출한다', () => {
    let opened: string | undefined = 'NOT_SET';
    const TREE2: DialogTree = {
      id: 'shop',
      startId: 'a',
      nodes: {
        a: { id: 'a', text: 'hi', choices: [
          { text: 'shop', next: null, effects: [{ type: 'openShop', shopId: 'main' }] },
        ] },
      },
    };
    const r = new DialogRunner({ tree: TREE2, adapter: TEST_ADAPTER, onOpenShop: (id) => { opened = id; } });
    r.choose(0);
    expect(opened).toBe('main');
  });
});
