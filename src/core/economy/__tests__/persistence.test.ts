import { createGaesupRuntime } from '../../runtime';
import { SaveSystem } from '../../save';
import { createEconomyPlugin } from '../plugin';
import { useShopStore } from '../stores/shopStore';
import { useWalletStore } from '../stores/walletStore';
import type { ShopSerialized } from '../types';

test.each([NaN, Infinity, -1])('rejects invalid wallet values before changing state: %s', (value) => {
  const before = useWalletStore.getState();
  for (const key of ['bells', 'lifetimeEarned', 'lifetimeSpent']) {
    expect(() => before.prepareHydrate({ ...before.serialize(), [key]: value })).toThrow(TypeError);
    expect(useWalletStore.getState()).toBe(before);
  }
});

test.each([
  [{ itemId: 'apple', price: -1 }], [{ itemId: 'apple', price: Infinity }],
  [{ itemId: 'apple', stock: -1 }], [{ itemId: 'apple', stock: 0.5 }],
  [{ itemId: 'apple' }, { itemId: 'apple' }],
])('rejects malformed shop offers without mutation: %j', (dailyStock) => {
  const before = useShopStore.getState();
  expect(() => before.prepareHydrate({ version: 1, lastRolledDay: 0, dailyStock })).toThrow(TypeError);
  expect(useShopStore.getState()).toBe(before);
});

test('prepares owned offers and wallet values without changing live state', () => {
  const shop = useShopStore.getState();
  const wallet = useWalletStore.getState();
  try {
    const data: ShopSerialized = { version: 1, lastRolledDay: 2, dailyStock: [{ itemId: 'apple', price: 10, stock: 2 }] };
    const money = { version: 1, bells: 30, lifetimeEarned: 40, lifetimeSpent: 10 };
    const applyShop = shop.prepareHydrate(data);
    const applyWallet = wallet.prepareHydrate(money);
    data.dailyStock[0]!.stock = 99;
    money.bells = 99;
    expect(useShopStore.getState()).toBe(shop);
    expect(useWalletStore.getState()).toBe(wallet);
    applyShop();
    applyWallet();
    expect(useShopStore.getState().dailyStock[0]!.stock).toBe(2);
    expect(useWalletStore.getState().bells).toBe(30);
  } finally {
    useShopStore.setState(shop);
    useWalletStore.setState(wallet);
  }
});

test('runtime rejects corrupt shop data before applying a valid wallet snapshot', async () => {
  const before = useWalletStore.getState();
  const save = new SaveSystem({ adapter: {
    read: async () => null, write: async () => undefined,
    list: async () => [], remove: async () => undefined,
  } });
  const runtime = createGaesupRuntime({ saveSystem: save, plugins: [createEconomyPlugin()], logger: { warn: () => undefined } });
  await runtime.setup();
  try {
    expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
      wallet: { version: 1, bells: 5, lifetimeEarned: 0, lifetimeSpent: 0 },
      shop: { version: 1, lastRolledDay: 0, dailyStock: [{ itemId: 'apple', stock: -1 }] },
    } })).toThrow('Save hydration failed');
    expect(useWalletStore.getState()).toBe(before);
  } finally { await runtime.dispose(); }
});
