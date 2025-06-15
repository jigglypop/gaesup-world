import { StateCreator } from 'zustand';

export interface UrlsState {
  characterUrl: string | null;
  vehicleUrl: string | null;
  airplaneUrl: string | null;
  wheelUrl: string | null;
  ridingUrl: string | null;
}

export interface UrlsSlice {
  urls: UrlsState;
  setUrls: (update: Partial<UrlsState>) => void;
}

export const createUrlsSlice: StateCreator<UrlsSlice, [], [], UrlsSlice> = (set) => ({
  urls: {
    characterUrl: null,
    vehicleUrl: null,
    airplaneUrl: null,
    wheelUrl: null,
    ridingUrl: null,
  },
  setUrls: (update) => set((state) => ({ urls: { ...state.urls, ...update } })),
});
