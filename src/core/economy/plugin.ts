import type { GaesupPlugin, PluginContext } from '../plugins';
import { useShopStore } from './stores/shopStore';
import { useWalletStore } from './stores/walletStore';
import type { ShopSerialized, WalletSerialized } from './types';

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

export function serializeWalletState(): WalletSerialized {
  return useWalletStore.getState().serialize();
}

export function hydrateWalletState(data: WalletSerialized | null | undefined): void {
  useWalletStore.getState().hydrate(data);
}

export function serializeShopState(): ShopSerialized {
  return useShopStore.getState().serialize();
}

export function hydrateShopState(data: ShopSerialized | null | undefined): void {
  useShopStore.getState().hydrate(data);
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
      ctx.save.register(walletSaveExtensionId, {
        key: walletSaveExtensionId,
        serialize: serializeWalletState,
        hydrate: hydrateWalletState,
      }, pluginId);
      ctx.save.register(shopSaveExtensionId, {
        key: shopSaveExtensionId,
        serialize: serializeShopState,
        hydrate: hydrateShopState,
      }, pluginId);
      ctx.services.register(walletStoreServiceId, {
        useStore: useWalletStore,
        getState: useWalletStore.getState,
        setState: useWalletStore.setState,
      }, pluginId);
      ctx.services.register(shopStoreServiceId, {
        useStore: useShopStore,
        getState: useShopStore.getState,
        setState: useShopStore.setState,
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
