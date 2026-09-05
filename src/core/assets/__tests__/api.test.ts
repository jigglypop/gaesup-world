import { HttpAssetSource } from '../api';

const VALID = { id: 'hat', name: '모자', kind: 'characterPart', slot: 'hat', tags: ['starter'], colors: { primary: '#fff' }, metadata: { owned: true } };

test.each([
  { kind: 'unknown' }, { slot: 'unknown' }, { id: ' ' },
  { tags: 'starter' }, { tags: [123] }, { tags: null },
  { url: 123 }, { thumbnailUrl: {} }, { previewUrl: false },
  { colors: { primary: 123 } }, { colors: null }, { metadata: [] },
])('filters malformed asset fields %j from list and item responses', async (patch) => {
  let payload: unknown = [{ ...VALID, ...patch }, VALID];
  const fetcher = jest.fn(async () => ({ ok: true, status: 200, json: async () => payload } as Response));
  const source = new HttpAssetSource('/api', fetcher);
  expect(await source.listAssets()).toEqual([VALID]);
  payload = { ...VALID, ...patch };
  expect(await source.getAsset('hat')).toBeUndefined();
});

test('preserves valid custom metadata and optional fields', async () => {
  const fetcher = jest.fn(async () => ({ ok: true, status: 200, json: async () => [VALID, { id: 'prop', name: '소품', kind: 'object3d' }] } as Response));
  expect(await new HttpAssetSource('/api', fetcher).listAssets()).toEqual([VALID, { id: 'prop', name: '소품', kind: 'object3d' }]);
});
