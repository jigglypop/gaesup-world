import { PACKAGE_ENTRIES } from '../../scripts/lib/packageEntries.cjs';

describe('runtime export snapshot', () => {
  test.each(PACKAGE_ENTRIES.map((entry) => [entry.subpath, entry.specifier]))('%s export 목록', async (_subpath, specifier) => {
    const exported = Object.keys((await import(specifier)) as object).filter((name) => name !== 'default').sort();
    expect(exported).toMatchSnapshot();
  });
});
