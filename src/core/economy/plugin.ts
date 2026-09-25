import type { GaesupPlugin, PluginContext } from '../plugins';
import { useShopStore, type ShopStore, SHOP_STORE_SERVICE } from './stores/shopStore';
import { useWalletStore, type WalletStore, WALLET_STORE_SERVICE } from './stores/walletStore';
import type { ShopSerialized, WalletSerialized } from './types';
import { createIdentityRevision } from '../save/core/revision';

export interface EconomyPluginOptions {
  id?: string;
  walletSaveExtensionId?: string;
  shopSaveExtensionId?: string;
  walletStoreServiceId?: string;
  shopStoreServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.economy';
const DEFAULT_WALLET_SAVE_EXTENSION_ID = 'wallet';
const DEFAULT_SHOP_SAVE_EXTENSION_ID = 'shop';
const DEFAULT_WALLET_STORE_SERVICE_ID = 'wallet.store';
const DEFAULT_SHOP_STORE_SERVICE_ID = 'shop.store';

export function serializeWalletState(store: WalletStore = useWalletStore): WalletSerialized {
  return store.getState().serialize();
}

export function hydrateWalletState(data: WalletSerialized | null | undefined, store: WalletStore = useWalletStore): void {
  store.getState().hydrate(data);
}

export function serializeShopState(store: ShopStore = useShopStore): ShopSerialized {
  return store.getState().serialize();
}

export function hydrateShopState(data: ShopSerialized | null | undefined, store: ShopStore = useShopStore): void {
  store.getState().hydrate(data);
}

export function createEconomyPlugin(options: EconomyPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const walletSaveExtensionId = options.walletSaveExtensionId ?? DEFAULT_WALLET_SAVE_EXTENSION_ID;
  const shopSaveExtensionId = options.shopSaveExtensionId ?? DEFAULT_SHOP_SAVE_EXTENSION_ID;
  const walletStoreServiceId = options.walletStoreServiceId ?? DEFAULT_WALLET_STORE_SERVICE_ID;
  const shopStoreServiceId = options.shopStoreServiceId ?? DEFAULT_SHOP_STORE_SERVICE_ID;

  return {
    id: pluginId,
    name: 'GaeSup Economy',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['economy', 'wallet', 'shop'],
    setup(ctx: PluginContext) {
      const shop = ctx.services.get(SHOP_STORE_SERVICE) ?? useShopStore;
      const wallet = ctx.services.get(WALLET_STORE_SERVICE) ?? useWalletStore;
      ctx.save.register(walletSaveExtensionId, {
        key: walletSaveExtensionId,
        serialize: () => serializeWalletState(wallet),
        hydrate: (data: WalletSerialized | null | undefined) => hydrateWalletState(data, wallet),
        prepareHydrate: (data: WalletSerialized | null | undefined) => wallet.getState().prepareHydrate(data),
        revision: createIdentityRevision(() => [wallet.getState()]),
      }, pluginId);
      ctx.save.register(shopSaveExtensionId, {
        key: shopSaveExtensionId,
        serialize: () => serializeShopState(shop),
        hydrate: (data: ShopSerialized | null | undefined) => hydrateShopState(data, shop),
        prepareHydrate: (data: ShopSerialized | null | undefined) => shop.getState().prepareHydrate(data),
        revision: createIdentityRevision(() => [shop.getState()]),
      }, pluginId);
      ctx.services.register(walletStoreServiceId, {
        useStore: wallet,
        getState: wallet.getState,
        setState: wallet.setState,
      }, pluginId);
      ctx.services.register(shopStoreServiceId, {
        useStore: shop,
        getState: shop.getState,
        setState: shop.setState,
      }, pluginId);
      ctx.events.emit('economy:ready', {
        pluginId,
        walletSaveExtensionId,
        shopSaveExtensionId,
        walletStoreServiceId,
        shopStoreServiceId,
      });
    },
    dispose(ctx: PluginContext) {
      ctx.save.remove(walletSaveExtensionId);
      ctx.save.remove(shopSaveExtensionId);
      ctx.services.remove(walletStoreServiceId);
      ctx.services.remove(shopStoreServiceId);
    },
  };
}

export const economyPlugin = createEconomyPlugin();
