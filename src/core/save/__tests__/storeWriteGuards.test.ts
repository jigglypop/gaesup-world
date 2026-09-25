import { createCatalogStore } from '../../catalog/stores/catalogStore';
import { createShopStore } from '../../economy/stores/shopStore';
import { createWalletStore } from '../../economy/stores/walletStore';
import { registerSeedCrops } from '../../farming/data/crops';
import { getCropRegistry } from '../../farming/registry/CropRegistry';
import { createPlotStore } from '../../farming/stores/plotStore';
import { GameplayEventEngine } from '../../gameplay/events/engine';
import { createDefaultGameplayEventRegistry } from '../../gameplay/events/registry';
import { createInventoryStore } from '../../inventory/stores/inventoryStore';
import { createMailStore } from '../../mail/stores/mailStore';
import { createFriendshipStore } from '../../relations/stores/friendshipStore';
import { createTownStore } from '../../town/stores/townStore';

type Saveable = { getState(): { serialize(): unknown; hydrate(data: never): void } };

/** A store written only through its API must load its own save, the way a player's autosave does. */
function expectLoadsOwnSave(store: Saveable): void {
  const saved = JSON.parse(JSON.stringify(store.getState().serialize())) as never;
  expect(() => store.getState().hydrate(saved)).not.toThrow();
}

beforeAll(() => registerSeedCrops());

test('mail refuses messages its load would reject', () => {
  const mail = createMailStore(createInventoryStore(), createWalletStore());
  const base = { from: 'mayor', subject: 'hi', body: '' };
  expect(mail.getState().send({ ...base, sentDay: 1.5 })).toBe('');
  expect(mail.getState().send({ ...base, sentDay: 2, attachments: [{ itemId: 'wood', count: 0 }] })).toBe('');
  expect(mail.getState().send({ ...base, id: ' ', sentDay: 2 })).toBe('');
  expect(mail.getState().messages).toEqual([]);
  expect(mail.getState().send({ ...base, sentDay: 2, attachments: [{ bells: 50 }] })).not.toBe('');
  expectLoadsOwnSave(mail);
});

test('relations ignore amounts and days its load would reject', () => {
  const relations = createFriendshipStore();
  expect(relations.getState().add('npc', Number.NaN, 1)).toBe(0);
  expect(relations.getState().add('npc', 5, 1.5)).toBe(0);
  expect(relations.getState().add(' ', 5, 1)).toBe(0);
  expect(relations.getState().giveGift('npc', ' ', 1)).toEqual({ gained: 0, capped: false });
  relations.getState().ensure('');
  expect(relations.getState().entries).toEqual({});
  expect(relations.getState().add('npc', 5, 1)).toBe(5);
  expectLoadsOwnSave(relations);
});

test('town refuses houses, residents and days its load would reject', () => {
  const town = createTownStore();
  town.getState().registerHouse({ id: 'flat', position: [0, 0, 0], size: [0, 4] });
  town.getState().registerResident({ id: ' ', name: 'ghost' });
  town.getState().registerHouse({ id: 'home', position: [0, 0, 0] });
  town.getState().registerResident({ id: 'kay', name: 'Kay' });
  expect(town.getState().moveIn('home', 'kay', 2.5)).toBe(false);
  expect(town.getState().reserveHouse('home', 'kay', -1)).toBe(false);
  expect(Object.keys(town.getState().houses)).toEqual(['home']);
  expect(town.getState().moveIn('home', 'kay', 3)).toBe(true);
  expectLoadsOwnSave(town);
});

test('shop ignores roll days and catalog ids its load would reject', () => {
  const shop = createShopStore(createInventoryStore(), createWalletStore());
  shop.getState().rollDailyStock(1.5);
  expect(shop.getState().lastRolledDay).toBe(-1);
  shop.getState().setCatalog(['', 'apple']);
  expect(shop.getState().catalog).toEqual(['apple']);
  shop.getState().rollDailyStock(2);
  expect(shop.getState().dailyStock.map((offer) => offer.itemId)).toEqual(['apple']);
  expectLoadsOwnSave(shop);
});

test('farming refuses bad plots and clocks, and a crop without stages keeps a valid stage', () => {
  const farming = createPlotStore(createInventoryStore());
  farming.getState().registerPlot({ id: 'lost', position: [0, Number.NaN, 0] });
  expect(farming.getState().plots).toEqual({});
  getCropRegistry().register({ ...getCropRegistry().require('crop.turnip'), id: 'crop.stageless', stages: [] });
  farming.getState().registerPlot({ id: 'bare', position: [0, 0, 0], state: 'planted', cropId: 'crop.stageless', plantedAt: 0, stageIndex: 0 });
  farming.getState().registerPlot({ id: 'young', position: [4, 0, 0], state: 'planted', cropId: 'crop.turnip', plantedAt: 0, stageIndex: 0 });
  farming.getState().tick(Number.NaN);
  expect(farming.getState().plots['young']?.state).toBe('planted');
  expect(farming.getState().water('young', -1)).toBe(false);
  farming.getState().tick(1);
  expect(farming.getState().plots['bare']?.stageIndex).toBe(0);
  expectLoadsOwnSave(farming);
});

test('catalog ignores counts and days its load would reject', () => {
  const catalog = createCatalogStore();
  catalog.getState().record('fish', 1.5, 1);
  catalog.getState().record('fish', 1, 2.5);
  catalog.getState().record(' ', 1, 1);
  expect(catalog.getState().size()).toBe(0);
  catalog.getState().record('fish', 2, 1);
  expectLoadsOwnSave(catalog);
});

test('a NaN gameplay flag is dropped instead of failing every later save', async () => {
  const engine = new GameplayEventEngine({
    registry: createDefaultGameplayEventRegistry(),
    blueprints: [{
      id: 'flags', name: 'flags', trigger: { type: 'manual', key: 'flags' }, policy: { run: 'once' },
      actions: [{ type: 'setFlag', key: 'broken', value: Number.NaN }, { type: 'setFlag', key: 'fine', value: 1 }],
    }],
  });
  await engine.dispatch({ type: 'manual', key: 'flags' });
  expect(engine.serialize().flags).toEqual({ fine: 1 });
});
