import { atom } from 'jotai';
import { ResourceUrlsType, SizesType } from '../types';

export interface ResourceStateType {
  urls: ResourceUrlsType;
  sizes: SizesType;
}

export const resourceStateAtom = atom<ResourceStateType>({
  urls: {
    characterUrl: null,
    vehicleUrl: null,
    airplaneUrl: null,
    wheelUrl: null,
    ridingUrl: null,
  },
  sizes: {},
});

// 개별 접근을 위한 derived atoms
export const urlsAtom = atom(
  (get) => get(resourceStateAtom).urls,
  (get, set, update: Partial<ResourceUrlsType>) => {
    const current = get(resourceStateAtom);
    set(resourceStateAtom, {
      ...current,
      urls: { ...current.urls, ...update }
    });
  }
);

export const sizesAtom = atom(
  (get) => get(resourceStateAtom).sizes,
  (get, set, update: Partial<SizesType>) => {
    const current = get(resourceStateAtom);
    set(resourceStateAtom, {
      ...current,
      sizes: { ...current.sizes, ...update }
    });
  }
); 