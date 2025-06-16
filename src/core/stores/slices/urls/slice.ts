import { StateCreator } from 'zustand';
import { UrlsSlice } from './types';

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
