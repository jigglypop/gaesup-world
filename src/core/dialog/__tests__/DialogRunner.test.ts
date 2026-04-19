import { registerSeedItems } from '../../items/data/items';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useWalletStore } from '../../economy/stores/walletStore';
import { DialogRunner } from '../core/DialogRunner';
import type { DialogTree } from '../types';

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

describe('DialogRunner', () => {
  test('giveItem effect populates inventory and ends', () => {
    const r = new DialogRunner({ tree: TREE });
    expect(r.current?.id).toBe('a');
    r.choose(0);
    expect(useInventoryStore.getState().countOf('apple')).toBe(2);
    expect(r.current?.id).toBe('b');
    r.advance();
    expect(r.isFinished()).toBe(true);
  });

  test('giveBells effect updates wallet', () => {
    const r = new DialogRunner({ tree: TREE });
    r.choose(1);
    expect(useWalletStore.getState().bells).toBe(50);
    expect(r.current?.id).toBe('c');
  });

  test('condition hides choice unless requirement met', () => {
    const r = new DialogRunner({ tree: TREE });
    expect(r.visibleChoices().length).toBe(2);
    useInventoryStore.getState().add('wood', 1);
    const r2 = new DialogRunner({ tree: TREE });
    expect(r2.visibleChoices().length).toBe(3);
  });

  test('openShop triggers callback', () => {
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
    const r = new DialogRunner({ tree: TREE2, onOpenShop: (id) => { opened = id; } });
    r.choose(0);
    expect(opened).toBe('main');
  });
});
