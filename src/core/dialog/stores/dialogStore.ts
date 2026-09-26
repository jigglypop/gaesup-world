import { create } from 'zustand';

import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';
import { DialogRunner, type DialogRunnerOptions } from '../core/DialogRunner';
import { getDialogRegistry, type DialogRegistry } from '../registry/DialogRegistry';
import type { DialogNode, DialogTreeId } from '../types';

export type DialogStartOptions = Omit<DialogRunnerOptions, 'tree'>;

type DialogState = {
  runner: DialogRunner | null;
  node: DialogNode | null;
  npcId: string | undefined;

  start: (treeId: DialogTreeId, options?: DialogStartOptions) => boolean;
  advance: () => void;
  choose: (index: number) => void;
  close: () => void;
};

/** Trees start from `registry`; the page registry when no runtime passes its own. */
export function createDialogStore(registry: DialogRegistry = getDialogRegistry()) {
  return create<DialogState>((set, get) => {
    const settle = (next: DialogNode | null) => set(next ? { node: next } : { node: null, runner: null, npcId: undefined });
    return {
      runner: null,
      node: null,
      npcId: undefined,

      start: (treeId, options = {}) => {
        const tree = registry.get(treeId);
        if (!tree) return false;
        const runner = new DialogRunner({ ...options, tree });
        set({ runner, node: runner.current, npcId: options.context?.npcId });
        return true;
      },

      advance: () => {
        const runner = get().runner;
        if (runner) settle(runner.advance());
      },

      choose: (index) => {
        const runner = get().runner;
        if (runner) settle(runner.choose(index));
      },

      close: () => set({ runner: null, node: null, npcId: undefined }),
    };
  });
}

export type DialogStore = ReturnType<typeof createDialogStore>;
export const DIALOG_STORE_SERVICE = runtimeStoreServiceKey<DialogStore>('dialog');
export const { useStore: useDialogStore, useStoreApi: useDialogStoreApi } = lazyScopedStore(
  'useDialogStore', () => createDialogStore(), () => useGaesupRuntime()?.dialogStore,
);

/** The registry the nearest world's dialog store reads trees from. */
export const useDialogRegistry = (): DialogRegistry => useGaesupRuntime()?.dialogRegistry ?? getDialogRegistry();
