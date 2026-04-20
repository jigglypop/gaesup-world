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
    const blob = useCharacterStore.getState().serialize();
    useCharacterStore.getState().resetAppearance();
    expect(useCharacterStore.getState().appearance.name).toBe('플레이어');
    useCharacterStore.getState().hydrate(blob);
    const a = useCharacterStore.getState().appearance;
    expect(a.name).toBe('루이');
    expect(a.colors.top).toBe('#abcdef');
    expect(a.hair).toBe('cap');
    expect(useCharacterStore.getState().outfits.shoes).toBe('sneaker');
  });

  test('hydrate ignores invalid payloads', () => {
    useCharacterStore.getState().setName('루이');
    useCharacterStore.getState().hydrate(null);
    useCharacterStore.getState().hydrate({ version: 99 } as never);
    expect(useCharacterStore.getState().appearance.name).toBe('루이');
  });
});
