import { useCharacterStore } from '../stores/characterStore';
import { DEFAULT_APPEARANCE } from '../types';

beforeEach(() => {
  useCharacterStore.getState().resetAppearance();
});

describe('characterStore', () => {
  test('default appearance is applied on reset', () => {
    expect(useCharacterStore.getState().appearance.name).toBe(DEFAULT_APPEARANCE.name);
    expect(useCharacterStore.getState().appearance.colors.body).toBe(DEFAULT_APPEARANCE.colors.body);
  });

  test('setName clamps long names and falls back when empty', () => {
    useCharacterStore.getState().setName('a'.repeat(40));
    expect(useCharacterStore.getState().appearance.name.length).toBe(16);
    useCharacterStore.getState().setName('');
    expect(useCharacterStore.getState().appearance.name).toBe('플레이어');
  });

  test('setColor / setHair / setFace mutate the store', () => {
    useCharacterStore.getState().setColor('hair', '#ff00ff');
    useCharacterStore.getState().setHair('long');
    useCharacterStore.getState().setFace('wink');
    const a = useCharacterStore.getState().appearance;
    expect(a.colors.hair).toBe('#ff00ff');
    expect(a.hair).toBe('long');
    expect(a.face).toBe('wink');
  });

  test('equipOutfit sets and clears slots', () => {
    useCharacterStore.getState().equipOutfit('hat', 'straw-hat');
    expect(useCharacterStore.getState().outfits.hat).toBe('straw-hat');
    useCharacterStore.getState().equipOutfit('hat', null);
    expect(useCharacterStore.getState().outfits.hat).toBeNull();
  });

  test('serialize/hydrate round-trips state', () => {
    useCharacterStore.getState().setName('루이');
    useCharacterStore.getState().setColor('top', '#abcdef');
    useCharacterStore.getState().setHair('cap');
    useCharacterStore.getState().equipOutfit('shoes', 'sneaker');
    useCharacterStore.getState().equipOutfit('weapon', 'starter-sword');
    const blob = useCharacterStore.getState().serialize();
    expect(blob.version).toBe(3);
    useCharacterStore.getState().resetAppearance();
    expect(useCharacterStore.getState().appearance.name).toBe('플레이어');
    useCharacterStore.getState().hydrate(blob);
    const a = useCharacterStore.getState().appearance;
    expect(a.name).toBe('루이');
    expect(a.colors.top).toBe('#abcdef');
    expect(a.hair).toBe('cap');
    expect(useCharacterStore.getState().outfits.shoes).toBe('sneaker');
    expect(useCharacterStore.getState().outfits.weapon).toBe('starter-sword');
  });

  test('hydrate accepts v1 payloads and fills new slots', () => {
    useCharacterStore.getState().hydrate({
      version: 1,
      appearance: DEFAULT_APPEARANCE,
      outfits: {
        hat: 'old-hat',
        top: null,
        bottom: null,
        shoes: null,
        face: null,
      },
    });

    const state = useCharacterStore.getState();
    expect(state.outfits.hat).toBe('old-hat');
    expect(state.outfits.weapon).toBeNull();
    expect(state.outfits.accessory).toBeNull();
  });

  test('getEquippedAssetIds returns active outfit ids', () => {
    useCharacterStore.getState().equipOutfit('weapon', 'starter-sword');
    useCharacterStore.getState().equipOutfit('accessory', 'blue-scarf');

    expect(useCharacterStore.getState().getEquippedAssetIds()).toEqual(['starter-sword', 'blue-scarf']);
  });

  test('equipOutfit with characterId keeps per-character outfits independent', () => {
    useCharacterStore.getState().equipOutfit('weapon', 'starter-sword');
    useCharacterStore.getState().equipOutfit('weapon', 'npc-axe', 'npc-1');
    useCharacterStore.getState().equipOutfit('top', 'npc-armor', 'npc-1');

    const state = useCharacterStore.getState();
    expect(state.outfits.weapon).toBe('starter-sword');
    expect(state.characters['npc-1']?.outfits.weapon).toBe('npc-axe');
    expect(state.getEquippedAssetIds('npc-1')).toEqual(['npc-armor', 'npc-axe']);
    expect(state.getEquippedAssetIds()).toEqual(['starter-sword']);
  });

  test('setActiveCharacter switches the mirrored appearance/outfits', () => {
    useCharacterStore.getState().equipOutfit('weapon', 'starter-sword');
    useCharacterStore.getState().setName('NPC', 'npc-1');
    useCharacterStore.getState().equipOutfit('weapon', 'npc-axe', 'npc-1');

    useCharacterStore.getState().setActiveCharacter('npc-1');
    expect(useCharacterStore.getState().outfits.weapon).toBe('npc-axe');
    expect(useCharacterStore.getState().appearance.name).toBe('NPC');

    useCharacterStore.getState().setActiveCharacter('player');
    expect(useCharacterStore.getState().outfits.weapon).toBe('starter-sword');
  });

  test('serialize round-trips multiple characters', () => {
    useCharacterStore.getState().equipOutfit('weapon', 'starter-sword');
    useCharacterStore.getState().equipOutfit('weapon', 'npc-axe', 'npc-1');
    const blob = useCharacterStore.getState().serialize();

    useCharacterStore.getState().resetAppearance();
    expect(useCharacterStore.getState().characters['npc-1']).toBeUndefined();

    useCharacterStore.getState().hydrate(blob);
    expect(useCharacterStore.getState().outfits.weapon).toBe('starter-sword');
    expect(useCharacterStore.getState().characters['npc-1']?.outfits.weapon).toBe('npc-axe');
  });

  test('removeCharacter drops a profile and resets the active one', () => {
    useCharacterStore.getState().equipOutfit('weapon', 'npc-axe', 'npc-1');
    useCharacterStore.getState().removeCharacter('npc-1');
    expect(useCharacterStore.getState().characters['npc-1']).toBeUndefined();

    useCharacterStore.getState().equipOutfit('weapon', 'starter-sword');
    useCharacterStore.getState().removeCharacter('player');
    expect(useCharacterStore.getState().outfits.weapon).toBeNull();
  });

  test('hydrate ignores invalid payloads', () => {
    useCharacterStore.getState().setName('루이');
    useCharacterStore.getState().hydrate(null);
    useCharacterStore.getState().hydrate({ version: 99 } as never);
    expect(useCharacterStore.getState().appearance.name).toBe('루이');
  });
});
