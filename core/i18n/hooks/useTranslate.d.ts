import { useI18nStore } from '../stores/i18nStore';
export declare function useTranslate(): (key: string, vars?: Record<string, string | number>) => string;
export declare function useLocale(): {
    locale: ReturnType<typeof useI18nStore.getState>['locale'];
    setLocale: (l: ReturnType<typeof useI18nStore.getState>['locale']) => void;
};
