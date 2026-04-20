import { create } from 'zustand';

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

const FALLBACK: LocaleId = 'ko';

function detectLocale(): LocaleId {
  if (typeof navigator === 'undefined') return FALLBACK;
  const code = (navigator.language || FALLBACK).slice(0, 2).toLowerCase();
  if (code === 'ko' || code === 'en' || code === 'ja') return code;
  return FALLBACK;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? `{${k}}` : String(v);
  });
}

export const useI18nStore = create<State>((set, get) => ({
  locale: detectLocale(),
  bundle: { ko: {}, en: {}, ja: {} },

  setLocale: (locale) => set({ locale }),

  registerMessages: (locale, messages) => {
    const cur = get().bundle;
    set({
      bundle: {
        ...cur,
        [locale]: { ...cur[locale], ...messages },
      },
    });
  },

  registerBundle: (input) => {
    const cur = get().bundle;
    const next: LocaleBundle = { ...cur };
    (Object.keys(input) as LocaleId[]).forEach((loc) => {
      const incoming = input[loc];
      if (incoming) next[loc] = { ...cur[loc], ...incoming };
    });
    set({ bundle: next });
  },

  t: (key, vars) => {
    const { locale, bundle } = get();
    const main = bundle[locale]?.[key];
    if (main !== undefined) return interpolate(main, vars);
    const fallback = bundle[FALLBACK]?.[key];
    if (fallback !== undefined) return interpolate(fallback, vars);
    return interpolate(key, vars);
  },

  serialize: () => ({ version: 1, locale: get().locale }),

  hydrate: (data) => {
    if (!data || data.version !== 1) return;
    set({ locale: data.locale });
  },
}));

export function t(key: string, vars?: Record<string, string | number>): string {
  return useI18nStore.getState().t(key, vars);
}
