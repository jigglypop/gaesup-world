import type { AssetRecord } from '../../assets';
import { resolveCharacterBaseNodeExclusions, resolveCharacterParts } from '../resolveParts';
import type { OutfitSlot } from '../types';

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

describe('resolveCharacterParts', () => {
  it('passes a rigid tool bone and authored grip transform to the renderer', () => {
    const tool: AssetRecord = {
      id: 'axe', name: 'Axe', kind: 'weapon', slot: 'weapon', url: 'axe.glb',
      metadata: { deformation: 'rigid', attachment: {
        socket: 'rightHand', bone: 'hand.R', position: [0, 0.1, 0], rotation: [0, 0, 1], scale: [0.5, 0.5, 0.5],
      } },
    };
    const parts = resolveCharacterParts({ outfits: { ...emptyOutfits(), weapon: 'axe' }, assets: { axe: tool } });
    expect(parts[0]?.attachment).toEqual({
      bone: 'hand.R', position: [0, 0.1, 0], rotation: [0, 0, 1], scale: [0.5, 0.5, 0.5],
    });
    parts[0]!.attachment!.position[0] = 99;
    expect(tool.metadata?.['attachment']).toMatchObject({ position: [0, 0.1, 0] });
  });

  it.each([
    { socket: 'rightHand', position: [0, 0, 0] },
    { bone: ' ' },
    { bone: 'hand.R', scale: [1, Number.NaN, 1] },
    { bone: 'hand.R', position: [0, 1] },
  ])('ignores an invalid rigid attachment instead of drawing it at the body origin: %j', (attachment) => {
    const parts = resolveCharacterParts({
      baseParts: [{ url: 'default.glb', slot: 'weapon' }],
      outfits: { ...emptyOutfits(), weapon: 'axe' },
      assets: { axe: { id: 'axe', name: 'Axe', kind: 'weapon', url: 'axe.glb', metadata: { deformation: 'rigid', attachment } } },
    });
    expect(parts).toEqual([{ url: 'default.glb', slot: 'weapon' }]);
  });

  it('does not apply old overlay sockets to skinned garments', () => {
    const parts = resolveCharacterParts({
      outfits: { ...emptyOutfits(), weapon: 'sword' },
      assets: { sword: { id: 'sword', name: 'Sword', kind: 'weapon', url: 'sword.glb',
        metadata: { deformation: 'skinned', attachment: { bone: 'upper_arm.R', position: [1, 2, 3] } } } },
    });
    expect(parts[0]).not.toHaveProperty('attachment');
  });

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

  it('does not render placeholder equipment assets as full GLB parts', () => {
    const outfits = emptyOutfits();
    outfits.weapon = 'starter-weapon-layer';
    const assets: Record<string, AssetRecord> = {
      'starter-weapon-layer': {
        id: 'starter-weapon-layer',
        name: 'Starter Weapon Layer',
        kind: 'weapon',
        slot: 'weapon',
        url: 'cloth-placeholder.glb',
        metadata: { placeholder: true },
      },
    };

    const parts = resolveCharacterParts({
      baseParts: [{ url: 'base.glb', slot: 'body' }],
      outfits,
      assets,
    });

    expect(parts).toEqual([{ url: 'base.glb', slot: 'body' }]);
  });

  it('resolves base model node exclusions for equipped replacement slots', () => {
    expect(resolveCharacterBaseNodeExclusions([
      { id: 'body', slot: 'body', url: 'body.glb' },
      { id: 'cloth', slot: 'top', url: 'cloth.glb' },
    ])).toEqual(['tee']);
  });

  it('carries asset hideBodyRegions metadata into parts and exclusions', () => {
    const outfits = emptyOutfits();
    outfits.top = 'hoodie';
    const assets: Record<string, AssetRecord> = {
      hoodie: {
        id: 'hoodie',
        name: 'Hoodie',
        kind: 'characterPart',
        slot: 'top',
        url: 'hoodie.glb',
        metadata: { hideBodyRegions: ['torso_upper', 'arm_upper_left', 42] },
      },
    };

    const parts = resolveCharacterParts({ baseParts: [], outfits, assets });
    expect(parts).toEqual([
      {
        id: 'hoodie',
        slot: 'top',
        url: 'hoodie.glb',
        hideNodeNames: ['torso_upper', 'arm_upper_left'],
      },
    ]);
    expect(resolveCharacterBaseNodeExclusions(parts)).toEqual([
      'torso_upper',
      'arm_upper_left',
      'tee',
    ]);
  });
});
