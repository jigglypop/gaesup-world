import type { AssetSource } from '../types';
import { useAssetStore } from '../stores/assetStore';

const mockSource = (assets: Awaited<ReturnType<AssetSource['listAssets']>>): AssetSource => ({
  listAssets: jest.fn().mockResolvedValue(assets),
  getAsset: jest.fn().mockResolvedValue(undefined),
  listByKind: jest.fn().mockResolvedValue([]),
  listBySlot: jest.fn().mockResolvedValue([]),
});

beforeEach(() => {
  useAssetStore.getState().resetAssets();
});

describe('assetStore', () => {
  it('loads assets from a source', async () => {
    const source = mockSource([
      {
        id: 'remote-hat',
        name: 'Remote Hat',
        kind: 'characterPart',
        slot: 'hat',
        url: 'hat.glb',
      },
    ]);

    await useAssetStore.getState().loadAssets(source);

    expect(useAssetStore.getState().getAsset('remote-hat')?.url).toBe('hat.glb');
    expect(useAssetStore.getState().error).toBeNull();
  });

  it('falls back to seed assets when a source fails', async () => {
    const source = {
      ...mockSource([]),
      listAssets: jest.fn().mockRejectedValue(new Error('offline')),
    };

    await useAssetStore.getState().loadAssets(source);

    expect(useAssetStore.getState().listAssets({ slot: 'top' }).length).toBeGreaterThan(0);
    expect(useAssetStore.getState().error).toBe('offline');
  });

  it('filters by kind and slot', () => {
    const store = useAssetStore.getState();

    expect(store.listAssets({ kind: 'weapon' }).every((asset) => asset.kind === 'weapon')).toBe(true);
    expect(store.listAssets({ slot: 'hat' }).every((asset) => asset.slot === 'hat')).toBe(true);
  });
});
