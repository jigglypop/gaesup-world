import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useShopStore } from '../stores/shopStore';
import { useWalletStore } from '../stores/walletStore';

const ITEM_ID = 'purchase-capacity-test';

test.each(['wallet', 'inventory', 'shop'] as const)('rejects nested trades from %s subscribers', (source) => {
  const inventory = useInventoryStore.getState();
  const wallet = useWalletStore.getState();
  const shop = useShopStore.getState();
  getItemRegistry().register({ id: ITEM_ID, name: 'Test', icon: '', category: 'material', stackable: true, maxStack: 10 });
  useInventoryStore.setState({ size: 1, slots: [null] });
  useWalletStore.setState({ bells: 100, lifetimeEarned: 0, lifetimeSpent: 0 });
  useShopStore.setState({ dailyStock: [{ itemId: ITEM_ID, price: 10, stock: 1 }] });
  let entered = false;
  const results: ReturnType<typeof shop.buy>[] = [];
  const handleChange = () => {
    if (entered) return;
    entered = true;
    results.push(shop.buy(ITEM_ID), shop.sell(ITEM_ID));
  };
  const unsubscribe = source === 'wallet' ? useWalletStore.subscribe(handleChange)
    : source === 'inventory' ? useInventoryStore.subscribe(handleChange)
    : useShopStore.subscribe(handleChange);
  try {
    expect(shop.buy(ITEM_ID)).toEqual({ ok: true });
    expect(results).toEqual([
      { ok: false, reason: 'trade in progress' },
      { ok: false, reason: 'trade in progress' },
    ]);
    expect(useInventoryStore.getState().countOf(ITEM_ID)).toBe(1);
    expect(useWalletStore.getState().bells).toBe(90);
    expect(useWalletStore.getState().lifetimeSpent).toBe(10);
    expect(useShopStore.getState().dailyStock[0]!.stock).toBe(0);
  } finally {
    unsubscribe();
    useInventoryStore.setState(inventory);
    useWalletStore.setState(wallet);
    useShopStore.setState(shop);
  }
});

test.each([1, 2])('purchase with room for one item and requested count %i', (count) => {
  const inventory = useInventoryStore.getState();
  const wallet = useWalletStore.getState();
  const shop = useShopStore.getState();
  getItemRegistry().register({ id: ITEM_ID, name: 'Test', icon: '', category: 'material', stackable: true, maxStack: 10 });
  useInventoryStore.setState({ size: 1, slots: [{ itemId: ITEM_ID, count: 9 }] });
  useWalletStore.setState({ bells: 100, lifetimeEarned: 0, lifetimeSpent: 0 });
  useShopStore.setState({ dailyStock: [{ itemId: ITEM_ID, price: 10, stock: 5 }] });
  try {
    const result = useShopStore.getState().buy(ITEM_ID, count);
    expect(result).toEqual(count === 1 ? { ok: true } : { ok: false, reason: 'inventory full' });
    expect(useInventoryStore.getState().countOf(ITEM_ID)).toBe(count === 1 ? 10 : 9);
    expect(useWalletStore.getState().bells).toBe(count === 1 ? 90 : 100);
    expect(useWalletStore.getState().lifetimeSpent).toBe(count === 1 ? 10 : 0);
    expect(useWalletStore.getState().lifetimeEarned).toBe(0);
    expect(useShopStore.getState().dailyStock[0]!.stock).toBe(count === 1 ? 4 : 5);
  } finally {
    useInventoryStore.setState(inventory);
    useWalletStore.setState(wallet);
    useShopStore.setState(shop);
  }
});

test.each([NaN, Infinity, 0.5, -1])('rejects invalid trade count %s', (count) => {
  expect(useShopStore.getState().buy(ITEM_ID, count)).toEqual({ ok: false, reason: 'invalid count' });
  expect(useShopStore.getState().sell(ITEM_ID, count)).toEqual({ ok: false, reason: 'invalid count' });
});

test.each(['buy', 'sell'] as const)('releases the trade guard after %s fails before mutation', (method) => {
  const inventory = useInventoryStore.getState();
  const wallet = useWalletStore.getState();
  const shop = useShopStore.getState();
  useInventoryStore.setState({ size: 1, slots: [{ itemId: ITEM_ID, count: 1 }] });
  useWalletStore.setState({ bells: 100, lifetimeEarned: 0, lifetimeSpent: 0 });
  useShopStore.setState({ dailyStock: [{ itemId: ITEM_ID, price: 10, stock: 1 }] });
  const failure = new Error('before mutation');
  if (method === 'buy') useWalletStore.setState({ spend: () => { throw failure; } });
  else useInventoryStore.setState({ removeById: () => { throw failure; } });
  try {
    expect(() => shop[method](ITEM_ID)).toThrow(failure);
    expect(useWalletStore.getState().bells).toBe(100);
    expect(useInventoryStore.getState().countOf(ITEM_ID)).toBe(1);
    useWalletStore.setState({ spend: wallet.spend });
    useInventoryStore.setState({ removeById: inventory.removeById });
    expect(shop[method](ITEM_ID)).toEqual({ ok: true });
  } finally {
    useInventoryStore.setState(inventory);
    useWalletStore.setState(wallet);
    useShopStore.setState(shop);
  }
});

test('selling rejects a nested purchase and permits the next independent trade', () => {
  const inventory = useInventoryStore.getState();
  const wallet = useWalletStore.getState();
  const shop = useShopStore.getState();
  useInventoryStore.setState({ size: 1, slots: [{ itemId: ITEM_ID, count: 1 }] });
  useWalletStore.setState({ bells: 100, lifetimeEarned: 0, lifetimeSpent: 0 });
  useShopStore.setState({ dailyStock: [{ itemId: ITEM_ID, price: 10, stock: 1 }] });
  const nested = jest.fn(() => shop.buy(ITEM_ID));
  const unsubscribe = useInventoryStore.subscribe(nested);
  try {
    expect(shop.sell(ITEM_ID)).toEqual({ ok: true });
    expect(nested).toHaveReturnedWith({ ok: false, reason: 'trade in progress' });
    expect(useInventoryStore.getState().countOf(ITEM_ID)).toBe(0);
    unsubscribe();
    expect(shop.buy(ITEM_ID)).toEqual({ ok: true });
    expect(useInventoryStore.getState().countOf(ITEM_ID)).toBe(1);
  } finally {
    unsubscribe();
    useInventoryStore.setState(inventory);
    useWalletStore.setState(wallet);
    useShopStore.setState(shop);
  }
});
