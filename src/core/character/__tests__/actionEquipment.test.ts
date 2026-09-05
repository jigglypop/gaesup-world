import {
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  applyCharacterEquipmentPreset,
  toggleCharacterWeapon,
} from '../actionEquipment';
import { useCharacterStore } from '../stores/characterStore';

beforeEach(() => {
  useCharacterStore.getState().resetAppearance();
});

describe('action equipment helpers', () => {
  test('applies the starter equipment preset', () => {
    applyCharacterEquipmentPreset(DEFAULT_CHARACTER_EQUIPMENT_PRESETS[0]!);

    const state = useCharacterStore.getState();
    expect(state.appearance.face).toBe('smile');
    expect(state.appearance.hair).toBe('cap');
    expect(state.outfits.hat).toBe('ally-hat');
    expect(state.outfits.weapon).toBe('starter-weapon-layer');
  });

  test('toggles a weapon item on and off', () => {
    toggleCharacterWeapon('starter-weapon-layer');
    expect(useCharacterStore.getState().outfits.weapon).toBe('starter-weapon-layer');

    toggleCharacterWeapon('starter-weapon-layer');
    expect(useCharacterStore.getState().outfits.weapon).toBeNull();
  });
});
