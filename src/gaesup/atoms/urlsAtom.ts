import { atom } from 'jotai';
import { ResourceUrlsType } from '../types';

export const urlsAtom = atom<ResourceUrlsType>({
  characterUrl: null,
  vehicleUrl: null,
  airplaneUrl: null,
  wheelUrl: null,
  ridingUrl: null,
}); 