import type { AssetRecord } from '../../assets';
import { resolveCharacterParts } from '../resolveParts';
import type { OutfitSlot } from '../types';

const emptyOutfits = (): Record<OutfitSlot, string | null> => ({
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null,
  weapon: null,
  accessory: null,
});

describe('resolveCharacterParts', () => {
  it('returns base parts when nothing is equipped', () => {
    const parts = resolveCharacterParts({
      baseParts: [{ url: 'base.glb', slot: 'top' }],
      outfits: emptyOutfits(),
      assets: {},
    });

    expect(parts).toEqual([{ url: 'base.glb', slot: 'top' }]);
  });

  it('replaces base parts in the same slot and appends equipment', () => {
    const outfits = emptyOutfits();
    outfits.top = 'red-top';
    outfits.weapon = 'sword';
    const assets: Record<string, AssetRecord> = {
      'red-top': {
        id: 'red-top',
        name: 'Red Top',
        kind: 'characterPart',
        slot: 'top',
        url: 'red-top.glb',
      },
      sword: {
        id: 'sword',
        name: 'Sword',
        kind: 'weapon',
        slot: 'weapon',
        url: 'sword.glb',
      },
    };

    const parts = resolveCharacterParts({
      baseParts: [{ url: 'base-top.glb', slot: 'top' }],
      outfits,
      assets,
    });

    expect(parts).toEqual([
      { id: 'red-top', slot: 'top', url: 'red-top.glb' },
      { id: 'sword', slot: 'weapon', url: 'sword.glb' },
    ]);
  });

  it('ignores missing or non-renderable assets', () => {
    const outfits = emptyOutfits();
    outfits.hat = 'missing';
    outfits.accessory = 'material';
    const assets: Record<string, AssetRecord> = {
      material: {
        id: 'material',
        name: 'Paint',
        kind: 'material',
        slot: 'accessory',
      },
    };

    const parts = resolveCharacterParts({
      baseParts: [{ url: 'base.glb' }],
      outfits,
      assets,
    });

    expect(parts).toEqual([{ url: 'base.glb' }]);
  });
});
