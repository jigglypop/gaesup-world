import { StateCreator } from 'zustand';

import { UrlsSlice, UrlsState } from './types';

const initialUrlsState: UrlsState = {
  characterUrl: '',
  vehicleUrl: '',
  airplaneUrl: '',
  wheelUrl: '',
  ridingUrl: '',
};

export const createUrlsSlice: StateCreator<UrlsSlice, [], [], UrlsSlice> = (set) => ({
  urls: initialUrlsState,
  setUrls: (update) =>
    set((state) => ({
      urls: { ...state.urls, ...update },
    })),
});
