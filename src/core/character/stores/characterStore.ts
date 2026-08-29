import { create } from 'zustand';

import {
  DEFAULT_APPEARANCE,
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

    hydrate: (data) => {
      if (!data) return;
      if (data.version === 3) {
        const entries = Object.entries(data.characters ?? {});
        if (entries.length === 0) return;
        const characters: Record<string, CharacterProfile> = {};
        for (const [id, profile] of entries) {
          characters[id] = {
            appearance: {
              ...DEFAULT_APPEARANCE,
              ...profile.appearance,
              colors: { ...DEFAULT_APPEARANCE.colors, ...profile.appearance?.colors },
            },
            outfits: { ...EMPTY_OUTFITS, ...profile.outfits },
          };
        }
        const activeCharacterId =
          data.activeCharacterId in characters ? data.activeCharacterId : Object.keys(characters)[0]!;
        const active = characters[activeCharacterId]!;
        set({
          activeCharacterId,
          characters,
          appearance: active.appearance,
          outfits: active.outfits,
        });
        return;
      }
      if (data.version !== 1 && data.version !== 2) return;
      set((s) =>
        applyToProfile(s, s.activeCharacterId, () => ({
          appearance: {
            ...DEFAULT_APPEARANCE,
            ...data.appearance,
            colors: { ...DEFAULT_APPEARANCE.colors, ...data.appearance.colors },
          },
          outfits: { ...EMPTY_OUTFITS, ...data.outfits },
        })),
      );
    },
  };
});
