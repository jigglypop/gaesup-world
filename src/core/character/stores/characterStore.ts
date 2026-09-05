import { create } from 'zustand';

import {
  DEFAULT_APPEARANCE,
  FACE_STYLE_LABEL,
  HAIR_STYLE_LABEL,
  type Appearance,
  type AppearanceColors,
  type CharacterProfile,
  type CharacterSerialized,
  type CharacterSerializedV1,
  type CharacterSerializedV2,
  type FaceStyle,
  type HairStyle,
  type OutfitSlot,
} from '../types';

export const DEFAULT_CHARACTER_ID = 'player';

export const EMPTY_OUTFITS: Record<OutfitSlot, string | null> = {
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null,
  glasses: null,
  weapon: null,
  accessory: null,
};

const createProfile = (): CharacterProfile => ({
  appearance: { ...DEFAULT_APPEARANCE, colors: { ...DEFAULT_APPEARANCE.colors } },
  outfits: { ...EMPTY_OUTFITS },
});

const cloneProfile = (profile: CharacterProfile): CharacterProfile => ({
  appearance: { ...profile.appearance, colors: { ...profile.appearance.colors } },
  outfits: { ...profile.outfits },
});

function prepareProfile(profile: { appearance?: Appearance; outfits?: Partial<CharacterProfile['outfits']> }): CharacterProfile {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)
    || (profile.appearance !== undefined && (!profile.appearance || typeof profile.appearance !== 'object' || Array.isArray(profile.appearance)))
    || (profile.appearance?.colors !== undefined && (!profile.appearance.colors || typeof profile.appearance.colors !== 'object' || Array.isArray(profile.appearance.colors)))
    || (profile.outfits !== undefined && (!profile.outfits || typeof profile.outfits !== 'object' || Array.isArray(profile.outfits)))) {
    throw new TypeError('Invalid character profile');
  }
  const prepared: CharacterProfile = {
    appearance: { ...DEFAULT_APPEARANCE, ...profile.appearance,
      colors: { ...DEFAULT_APPEARANCE.colors, ...profile.appearance?.colors } },
    outfits: { ...EMPTY_OUTFITS, ...profile.outfits },
  };
  if (typeof prepared.appearance.name !== 'string'
    || !Object.hasOwn(FACE_STYLE_LABEL, prepared.appearance.face)
    || !Object.hasOwn(HAIR_STYLE_LABEL, prepared.appearance.hair)
    || !Object.values(prepared.appearance.colors).every((color) => typeof color === 'string')
    || !Object.values(prepared.outfits).every((item) => item === null || typeof item === 'string')) {
    throw new TypeError('Invalid character appearance or outfit');
  }
  return prepared;
}

type CharacterState = {
  /** Character whose profile is mirrored on the top-level appearance/outfits fields. */
  activeCharacterId: string;
  characters: Record<string, CharacterProfile>;
  /** Mirror of the active character's appearance — kept for the pre-multi-character API. */
  appearance: Appearance;
  /** Mirror of the active character's outfits — kept for the pre-multi-character API. */
  outfits: Record<OutfitSlot, string | null>;

  setActiveCharacter: (characterId: string) => void;
  removeCharacter: (characterId: string) => void;
  getProfile: (characterId?: string) => CharacterProfile;

  setName: (name: string, characterId?: string) => void;
  setColor: (key: keyof AppearanceColors, value: string, characterId?: string) => void;
  setFace: (face: FaceStyle, characterId?: string) => void;
  setHair: (hair: HairStyle, characterId?: string) => void;
  equipOutfit: (slot: OutfitSlot, itemId: string | null, characterId?: string) => void;
  resetAppearance: (characterId?: string) => void;
  getEquippedAssetIds: (characterId?: string) => string[];

  serialize: () => CharacterSerialized;
  hydrate: (
    data: CharacterSerialized | CharacterSerializedV2 | CharacterSerializedV1 | null | undefined,
  ) => void;
  prepareHydrate: (
    data: CharacterSerialized | CharacterSerializedV2 | CharacterSerializedV1 | null | undefined,
  ) => () => void;
};

const applyToProfile = (
  s: Pick<CharacterState, 'activeCharacterId' | 'characters'>,
  characterId: string | undefined,
  updater: (profile: CharacterProfile) => CharacterProfile,
): Partial<CharacterState> => {
  const id = characterId ?? s.activeCharacterId;
  const next = updater(s.characters[id] ?? createProfile());
  const characters = { ...s.characters, [id]: next };
  return id === s.activeCharacterId
    ? { characters, appearance: next.appearance, outfits: next.outfits }
    : { characters };
};

export const useCharacterStore = create<CharacterState>((set, get) => {
  const initial = createProfile();
  return {
    activeCharacterId: DEFAULT_CHARACTER_ID,
    characters: { [DEFAULT_CHARACTER_ID]: initial },
    appearance: initial.appearance,
    outfits: initial.outfits,

    setActiveCharacter: (characterId) =>
      set((s) => {
        const profile = s.characters[characterId] ?? createProfile();
        return {
          activeCharacterId: characterId,
          characters: { ...s.characters, [characterId]: profile },
          appearance: profile.appearance,
          outfits: profile.outfits,
        };
      }),

    removeCharacter: (characterId) =>
      set((s) => {
        if (!(characterId in s.characters)) return {};
        const characters = { ...s.characters };
        delete characters[characterId];
        if (characterId !== s.activeCharacterId) return { characters };
        const fallback = createProfile();
        characters[s.activeCharacterId] = fallback;
        return { characters, appearance: fallback.appearance, outfits: fallback.outfits };
      }),

    getProfile: (characterId) => {
      const s = get();
      const profile = s.characters[characterId ?? s.activeCharacterId];
      return profile ? cloneProfile(profile) : createProfile();
    },

    setName: (name, characterId) =>
      set((s) =>
        applyToProfile(s, characterId, (p) => ({
          ...p,
          appearance: { ...p.appearance, name: name.slice(0, 16) || '플레이어' },
        })),
      ),

    setColor: (key, value, characterId) =>
      set((s) =>
        applyToProfile(s, characterId, (p) => ({
          ...p,
          appearance: {
            ...p.appearance,
            colors: { ...p.appearance.colors, [key]: value },
          },
        })),
      ),

    setFace: (face, characterId) =>
      set((s) =>
        applyToProfile(s, characterId, (p) => ({ ...p, appearance: { ...p.appearance, face } })),
      ),

    setHair: (hair, characterId) =>
      set((s) =>
        applyToProfile(s, characterId, (p) => ({ ...p, appearance: { ...p.appearance, hair } })),
      ),

    equipOutfit: (slot, itemId, characterId) =>
      set((s) =>
        applyToProfile(s, characterId, (p) => ({
          ...p,
          outfits: { ...p.outfits, [slot]: itemId },
        })),
      ),

    resetAppearance: (characterId) =>
      set((s) => {
        if (characterId !== undefined) {
          return applyToProfile(s, characterId, () => createProfile());
        }
        const fresh = createProfile();
        return {
          activeCharacterId: DEFAULT_CHARACTER_ID,
          characters: { [DEFAULT_CHARACTER_ID]: fresh },
          appearance: fresh.appearance,
          outfits: fresh.outfits,
        };
      }),

    getEquippedAssetIds: (characterId) => {
      const s = get();
      const outfits = s.characters[characterId ?? s.activeCharacterId]?.outfits ?? EMPTY_OUTFITS;
      return Object.values(outfits).filter(
        (id): id is string => typeof id === 'string' && id.length > 0,
      );
    },

    serialize: () => {
      const s = get();
      const characters: Record<string, CharacterProfile> = {};
      for (const [id, profile] of Object.entries(s.characters)) {
        characters[id] = cloneProfile(profile);
      }
      return {
        version: 3,
        activeCharacterId: s.activeCharacterId,
        characters,
      };
    },

    prepareHydrate: (data) => {
      if (data === null || data === undefined) return () => {};
      if (typeof data !== 'object' || ![1, 2, 3].includes(data.version)) throw new TypeError('Invalid character snapshot');
      if (data.version === 3) {
        if (!data.characters || typeof data.characters !== 'object' || Array.isArray(data.characters)
          || typeof data.activeCharacterId !== 'string' || !data.activeCharacterId.trim()) {
          throw new TypeError('Invalid character collection');
        }
        const entries = Object.entries(data.characters);
        if (entries.length === 0) return () => {};
        const characters = Object.fromEntries(entries.map(([id, profile]) => {
          if (!id.trim()) throw new TypeError('Invalid character ID');
          return [id, prepareProfile(profile)];
        }));
        const activeCharacterId =
          Object.hasOwn(characters, data.activeCharacterId) ? data.activeCharacterId : Object.keys(characters)[0]!;
        const active = characters[activeCharacterId]!;
        return () => set({
          activeCharacterId,
          characters,
          appearance: active.appearance,
          outfits: active.outfits,
        });
      }
      const profile = prepareProfile(data);
      return () => set((s) => applyToProfile(s, s.activeCharacterId, () => profile));
    },
    hydrate: (data) => get().prepareHydrate(data)(),
  };
});
