import type { I18nSerialized } from './types';
export interface I18nPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeI18nState(): I18nSerialized;
export declare function hydrateI18nState(data: I18nSerialized | null | undefined): void;
export declare function createI18nPlugin(options?: I18nPluginOptions): import("..").GaesupPlugin;
export declare const i18nPlugin: import("..").GaesupPlugin;
