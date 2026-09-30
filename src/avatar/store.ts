import { createStore } from 'zustand/vanilla';

import { parseAvatarState } from './core/manifest';
import type { AvatarState } from './core/types';
import { createStoreDomainPlugin } from '../core/plugins/storeDomainPlugin';
import type { DomainBinding } from '../core/save/types';

export function createAvatarStore(initial: AvatarState) {
  const defaults = parseAvatarState(initial);
  return createStore<{
    avatar: AvatarState;
    serialize: () => AvatarState;
    hydrate: (data: unknown) => void;
    prepareHydrate: (data: unknown) => () => void;
    setAvatar: (data: AvatarState) => void;
  }>((set, get) => ({
    avatar: defaults,
    serialize: () => parseAvatarState(get().avatar),
    hydrate: (data) => get().prepareHydrate(data)(),
    prepareHydrate: (data) => {
      const parsed = parseAvatarState(data ?? defaults);
      return () => set({ avatar: parsed });
    },
    setAvatar: (data) => set({ avatar: parseAvatarState(data) }),
  }));
}
export type AvatarStore = ReturnType<typeof createAvatarStore>;
export function createAvatarSaveBinding(store: AvatarStore, key = 'avatar'): DomainBinding {
  return {
    key,
    serialize: () => store.getState().serialize(),
    hydrate: (data) => store.getState().hydrate(data),
    prepareHydrate: (data) => store.getState().prepareHydrate(data),
  };
}
export function createAvatarPlugin(store: AvatarStore) {
  return createStoreDomainPlugin({
    id: 'gaesup.avatar',
    name: 'Gaesup Avatar',
    saveExtensionId: 'avatar',
    storeServiceId: 'avatar.store',
    store,
    readyEvent: 'avatar:ready',
    prepareHydrate: (data) => store.getState().prepareHydrate(data),
  });
}
