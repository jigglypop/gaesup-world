import { useCallback } from 'react';

import { useI18nStore } from '../stores/i18nStore';

export function useTranslate(): (key: string, vars?: Record<string, string | number>) => string {
  const locale = useI18nStore((s) => s.locale);
  const bundle = useI18nStore((s) => s.bundle);
  return useCallback(
    (key, vars) => {
      const main = bundle[locale]?.[key];
      if (main !== undefined) return interpolate(main, vars);
      const fallback = bundle.ko?.[key];
      if (fallback !== undefined) return interpolate(fallback, vars);
      return interpolate(key, vars);
    },
    [locale, bundle],
  );
}

export function useLocale(): { locale: ReturnType<typeof useI18nStore.getState>['locale']; setLocale: (l: ReturnType<typeof useI18nStore.getState>['locale']) => void } {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  return { locale, setLocale };
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? `{${k}}` : String(v);
  });
}
