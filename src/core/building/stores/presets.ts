import { create } from 'zustand';

import { useBuildingStore } from './buildingStore';

/**
 * 사용자 배치 프리셋: 현재 선택된 타일/벽/오브젝트 설정 조합을 이름으로
 * 저장했다가 한 번에 복원한다. localStorage에 persist 된다.
 */
const PLACEMENT_PRESET_FIELDS = [
  'editMode',
  'selectedTileCategoryId',
  'selectedTileGroupId',
  'currentTileMultiplier',
  'currentTileHeight',
  'currentTileShape',
  'currentTileRotation',
  'currentTileMaterialId',
  'selectedWallCategoryId',
  'selectedWallGroupId',
  'currentWallRotation',
  'currentWallMaterialId',
  'currentWallKind',
  'selectedPlacedObjectType',
  'selectedModelObjectId',
  'currentModelUrl',
  'currentModelScale',
  'currentModelColor',
  'currentObjectRotation',
  'currentObjectPrimaryColor',
  'currentObjectSecondaryColor',
  'currentTreeKind',
  'currentFlagWidth',
  'currentFlagHeight',
  'currentFlagImageUrl',
  'currentFlagStyle',
  'currentFireIntensity',
  'currentFireWidth',
  'currentFireHeight',
  'currentFireColor',
] as const;

type PlacementPresetField = (typeof PLACEMENT_PRESET_FIELDS)[number];

export type PlacementPresetValues = {
  [K in PlacementPresetField]?: ReturnType<typeof useBuildingStore.getState>[K];
};

export type PlacementPreset = {
  name: string;
  values: PlacementPresetValues;
};

const PLACEMENT_PRESET_STORAGE_KEY = 'gaesup.building.placementPresets';

function readStoredPresets(): PlacementPreset[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(PLACEMENT_PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PlacementPreset =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as PlacementPreset).name === 'string' &&
        typeof (item as PlacementPreset).values === 'object',
    );
  } catch {
    return [];
  }
}

function writeStoredPresets(presets: PlacementPreset[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(PLACEMENT_PRESET_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // 저장 실패는 무시한다. 프리셋은 보조 기능이다.
  }
}

export function capturePlacementPreset(name: string): PlacementPreset {
  const state = useBuildingStore.getState();
  const values: PlacementPresetValues = {};
  for (const field of PLACEMENT_PRESET_FIELDS) {
    (values as Record<string, unknown>)[field] = state[field];
  }
  return { name, values };
}

type PlacementPresetState = {
  presets: PlacementPreset[];
  save: (name: string) => void;
  apply: (name: string) => void;
  remove: (name: string) => void;
};

export const usePlacementPresets = create<PlacementPresetState>((set, get) => ({
  presets: readStoredPresets(),

  save: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const preset = capturePlacementPreset(trimmed);
    const presets = [...get().presets.filter((item) => item.name !== trimmed), preset];
    writeStoredPresets(presets);
    set({ presets });
  },

  apply: (name) => {
    const preset = get().presets.find((item) => item.name === name);
    if (!preset) return;
    useBuildingStore.setState((state) => {
      for (const field of PLACEMENT_PRESET_FIELDS) {
        if (field in preset.values) {
          (state as Record<string, unknown>)[field] = preset.values[field];
        }
      }
    });
  },

  remove: (name) => {
    const presets = get().presets.filter((item) => item.name !== name);
    writeStoredPresets(presets);
    set({ presets });
  },
}));
