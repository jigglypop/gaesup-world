import type { I18nSerialized, LocaleBundle, LocaleId, LocaleResource } from '../types';
type State = {
    locale: LocaleId;
    bundle: LocaleBundle;
    setLocale: (locale: LocaleId) => void;
    registerMessages: (locale: LocaleId, messages: LocaleResource) => void;
    registerBundle: (bundle: Partial<LocaleBundle>) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
    serialize: () => I18nSerialized;
    hydrate: (data: I18nSerialized | null | undefined) => void;
};
export declare const useI18nStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export declare function t(key: string, vars?: Record<string, string | number>): string;
export {};
