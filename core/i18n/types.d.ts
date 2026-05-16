export type LocaleId = 'ko' | 'en' | 'ja';
export type LocaleResource = Record<string, string>;
export type LocaleBundle = Record<LocaleId, LocaleResource>;
export type I18nSerialized = {
    version: 1;
    locale: LocaleId;
};
export declare const LOCALE_LABEL: Record<LocaleId, string>;
