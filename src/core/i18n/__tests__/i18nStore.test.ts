import { useI18nStore } from '../stores/i18nStore';

beforeEach(() => {
  useI18nStore.setState({
    locale: 'ko',
    bundle: { ko: {}, en: {}, ja: {} },
  });
});

describe('i18nStore', () => {
  test('registers messages per locale', () => {
    useI18nStore.getState().registerMessages('ko', { 'hi': '안녕' });
    useI18nStore.getState().registerMessages('en', { 'hi': 'hello' });
    expect(useI18nStore.getState().t('hi')).toBe('안녕');
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().t('hi')).toBe('hello');
  });

  test('falls back to ko when key is missing on active locale', () => {
    useI18nStore.getState().registerMessages('ko', { 'only': '한국어만' });
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().t('only')).toBe('한국어만');
  });

  test('returns the key itself when both locales are missing', () => {
    expect(useI18nStore.getState().t('missing.key')).toBe('missing.key');
  });

  test('interpolates {var} placeholders', () => {
    useI18nStore.getState().registerMessages('ko', { 'g': '{n}님 환영합니다' });
    expect(useI18nStore.getState().t('g', { n: '루이' })).toBe('루이님 환영합니다');
  });

  test('serialize/hydrate restores locale only', () => {
    useI18nStore.getState().setLocale('ja');
    const blob = useI18nStore.getState().serialize();
    useI18nStore.getState().setLocale('ko');
    useI18nStore.getState().hydrate(blob);
    expect(useI18nStore.getState().locale).toBe('ja');
  });

  test('registerBundle merges multiple locales at once', () => {
    useI18nStore.getState().registerBundle({
      ko: { 'a': '에이' },
      en: { 'a': 'a' },
    });
    expect(useI18nStore.getState().bundle.ko.a).toBe('에이');
    expect(useI18nStore.getState().bundle.en.a).toBe('a');
  });
});
