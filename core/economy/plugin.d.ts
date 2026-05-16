import type { GaesupPlugin } from '../plugins';
import type { ShopSerialized, WalletSerialized } from './types';
export interface EconomyPluginOptions {
    id?: string;
    walletSaveExtensionId?: string;
    shopSaveExtensionId?: string;
    walletStoreServiceId?: string;
    shopStoreServiceId?: string;
}
export declare function serializeWalletState(): WalletSerialized;
export declare function hydrateWalletState(data: WalletSerialized | null | undefined): void;
export declare function serializeShopState(): ShopSerialized;
export declare function hydrateShopState(data: ShopSerialized | null | undefined): void;
export declare function createEconomyPlugin(options?: EconomyPluginOptions): GaesupPlugin;
export declare const economyPlugin: GaesupPlugin;
