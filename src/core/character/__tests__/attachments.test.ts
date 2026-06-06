import {
  DEFAULT_CHARACTER_ATTACHMENT_SOCKETS,
  resolveCharacterAttachment,
  resolveEquippedCharacterAttachments,
} from '../attachments';
import type { OutfitSlot } from '../types';
import type { AssetRecord } from '../../assets';

const emptyOutfits = (): Record<OutfitSlot, string | null> => ({
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null,
  glasses: null,
  weapon: null,
  accessory: null,
});

describe('character attachments', () => {
  test('uses default socket transforms by outfit slot', () => {
    const asset: AssetRecord = {
      id: 'starter-sword',
      name: 'Starter Sword',
      kind: 'weapon',
      slot: 'weapon',
    };

    expect(resolveCharacterAttachment(asset, 'weapon')).toEqual({
      assetId: 'starter-sword',
      assetName: 'Starter Sword',
      kind: 'weapon',
      slot: 'weapon',
      ...DEFAULT_CHARACTER_ATTACHMENT_SOCKETS.weapon,
    });
  });

  test('asset metadata can override attachment socket transform', () => {
    const asset: AssetRecord = {
      id: 'back-sword',
      name: 'Back Sword',
      kind: 'weapon',
      slot: 'weapon',
      metadata: {
        attachment: {
          socket: 'back',
          position: [0, -0.2, -0.45],
          rotation: [0.2, 0, 0],
          scale: [0.8, 0.8, 0.8],
        },
      },
    };

    expect(resolveCharacterAttachment(asset, 'weapon')).toEqual({
      assetId: 'back-sword',
      assetName: 'Back Sword',
      kind: 'weapon',
      slot: 'weapon',
      socket: 'back',
      position: [0, -0.2, -0.45],
      rotation: [0.2, 0, 0],
      scale: [0.8, 0.8, 0.8],
    });
  });

  test('resolves equipped outfit assets into attachment records', () => {
    const outfits = emptyOutfits();
    outfits.weapon = 'starter-sword';
    outfits.glasses = 'round-glasses';
    outfits.accessory = 'gold-ring';

    const assets: Record<string, AssetRecord> = {
      'starter-sword': {
        id: 'starter-sword',
        name: 'Starter Sword',
        kind: 'weapon',
        slot: 'weapon',
      },
      'gold-ring': {
        id: 'gold-ring',
        name: 'Gold Ring',
        kind: 'characterPart',
        slot: 'accessory',
      },
      'round-glasses': {
        id: 'round-glasses',
        name: 'Round Glasses',
        kind: 'characterPart',
        slot: 'glasses',
      },
    };

    expect(resolveEquippedCharacterAttachments({ outfits, assets })).toEqual([
      expect.objectContaining({ assetId: 'round-glasses', socket: 'face' }),
      expect.objectContaining({ assetId: 'starter-sword', socket: 'rightHand' }),
      expect.objectContaining({ assetId: 'gold-ring', socket: 'face' }),
    ]);
  });
});
