import { create } from 'zustand';

import { SEED_ASSETS } from '../data/seedAssets';
import type {
  AssetCatalogStatus,
  AssetKind,
  AssetQuery,
  AssetRecord,
  AssetSlot,
  AssetSource,
} from '../types';

type AssetState = {
  records: Record<string, AssetRecord>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  catalogStatus: AssetCatalogStatus;
  selectedId: string | null;
  filter: AssetQuery;

  setFilter: (filter: AssetQuery) => void;
  selectAsset: (id: string | null) => void;
  registerAssets: (assets: AssetRecord[]) => void;
  loadAssets: (source: AssetSource, query?: AssetQuery) => Promise<void>;
  getAsset: (id: string) => AssetRecord | undefined;
  listAssets: (query?: AssetQuery) => AssetRecord[];
  resetAssets: () => void;
};

const toRecordMap = (assets: AssetRecord[]): Record<string, AssetRecord> => {
  const records: Record<string, AssetRecord> = {};
  for (const asset of assets) {
    records[asset.id] = { ...asset };
  }
  return records;
};

const filterAssets = (assets: AssetRecord[], query?: AssetQuery): AssetRecord[] => {
  if (!query) return assets;
  return assets.filter((asset) => {
    if (query.kind && asset.kind !== query.kind) return false;
    if (query.slot && asset.slot !== query.slot) return false;
    if (query.tag && !asset.tags?.includes(query.tag)) return false;
    return true;
  });
};

const seedRecords = toRecordMap(SEED_ASSETS);
const seedStatus: AssetCatalogStatus = {
  state: 'seed',
  origin: 'seed',
  assetCount: SEED_ASSETS.length,
  loadedAt: null,
  error: null,
  fallbackReason: null,
};

function createCatalogStatus(
  status: Omit<AssetCatalogStatus, 'query'>,
  query?: AssetQuery,
): AssetCatalogStatus {
  return query ? { ...status, query: { ...query } } : status;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  records: seedRecords,
  ids: SEED_ASSETS.map((asset) => asset.id),
  isLoading: false,
  error: null,
  catalogStatus: seedStatus,
  selectedId: null,
  filter: {},

  setFilter: (filter) => set({ filter: { ...filter } }),
  selectAsset: (id) => set({ selectedId: id }),

  registerAssets: (assets) =>
    set((state) => {
      const nextRecords = { ...state.records };
      const nextIds = new Set(state.ids);
      for (const asset of assets) {
        nextRecords[asset.id] = { ...asset };
        nextIds.add(asset.id);
      }
      return {
        records: nextRecords,
        ids: Array.from(nextIds),
      };
    }),

  loadAssets: async (source, query) => {
    set({
      isLoading: true,
      error: null,
      catalogStatus: createCatalogStatus({
        state: 'loading',
        origin: 'source',
        assetCount: get().ids.length,
        loadedAt: null,
        error: null,
        fallbackReason: null,
      }, query),
    });
    try {
      const assets = await source.listAssets(query);
      if (assets.length > 0) {
        get().registerAssets(assets);
        set({
          isLoading: false,
          catalogStatus: createCatalogStatus({
            state: 'loaded',
            origin: 'source',
            assetCount: assets.length,
            loadedAt: Date.now(),
            error: null,
            fallbackReason: null,
          }, query),
        });
        return;
      }

      get().registerAssets(SEED_ASSETS);
      set({
        isLoading: false,
        catalogStatus: createCatalogStatus({
          state: 'fallback',
          origin: 'seed',
          assetCount: SEED_ASSETS.length,
          loadedAt: Date.now(),
          error: null,
          fallbackReason: 'empty-source',
        }, query),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load assets';
      get().registerAssets(SEED_ASSETS);
      set({
        isLoading: false,
        error: message,
        catalogStatus: createCatalogStatus({
          state: 'fallback',
          origin: 'seed',
          assetCount: SEED_ASSETS.length,
          loadedAt: Date.now(),
          error: message,
          fallbackReason: message,
        }, query),
      });
    }
  },

  getAsset: (id) => get().records[id],

  listAssets: (query) => {
    const state = get();
    return filterAssets(
      state.ids.map((id) => state.records[id]).filter((asset): asset is AssetRecord => Boolean(asset)),
      query,
    );
  },

  resetAssets: () => set({
    records: seedRecords,
    ids: SEED_ASSETS.map((asset) => asset.id),
    isLoading: false,
    error: null,
    catalogStatus: seedStatus,
    selectedId: null,
    filter: {},
  }),
}));

export const selectAssetsByKind = (kind: AssetKind) => (state: AssetState) => state.listAssets({ kind });
export const selectAssetsBySlot = (slot: AssetSlot) => (state: AssetState) => state.listAssets({ slot });
