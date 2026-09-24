import { create } from 'zustand';

import { dialogRuntimeAdapter } from './runtimeAdapter';
import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useQuestStore, type QuestStore } from '../../quests/stores/questStore';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { createScopedStoreHook } from '../../stores/scopedStore';
import { DialogRunner } from '../core/DialogRunner';
import { getDialogRegistry } from '../registry/DialogRegistry';
import type { DialogContext, DialogEffect, DialogNode, DialogTreeId, DialogRuntimeAdapter } from '../types';

type CustomDialogEffect = Extract<DialogEffect, { type: 'custom' }>;

type DialogState = {
  runner: DialogRunner | null;
  node: DialogNode | null;
  npcId: string | undefined;

  start: (
    treeId: DialogTreeId,
    options?: {
      context?: DialogContext;
      onOpenShop?: (shopId?: string) => void;
      onCustomEffect?: (effect: CustomDialogEffect) => void;
    },
  ) => boolean;
  advance: () => void;
  choose: (index: number) => void;
  close: () => void;
};

export function createDialogStore(quests: QuestStore, adapter: DialogRuntimeAdapter) {
  return create<DialogState>((set, get) => ({
  runner: null,
  node: null,
  npcId: undefined,

  start: (treeId, options) => {
    const tree = getDialogRegistry().get(treeId);
    if (!tree) return false;
    const runner = new DialogRunner({
      tree,
      adapter,
      ...(options?.context ? { context: options.context } : {}),
      ...(options?.onCustomEffect ? { onCustomEffect: options.onCustomEffect } : {}),
      ...(options?.onOpenShop ? { onOpenShop: options.onOpenShop } : {}),
    });
    set({ runner, node: runner.current, npcId: options?.context?.npcId });
    if (options?.context?.npcId) quests.getState().notifyTalk(options.context.npcId);
    return true;
  },

  advance: () => {
    const r = get().runner;
    if (!r) return;
    const next = r.advance();
    set({ node: next });
    if (!next) set({ runner: null, npcId: undefined });
  },

  choose: (index) => {
    const r = get().runner;
    if (!r) return;
    const next = r.choose(index);
    set({ node: next });
    if (!next) set({ runner: null, npcId: undefined });
  },

  close: () => set({ runner: null, node: null, npcId: undefined }),
}));

}

export type DialogStore = ReturnType<typeof createDialogStore>;
export const DIALOG_STORE_SERVICE = runtimeStoreServiceKey<DialogStore>('dialog');
export const { useStore: useDialogStore, useStoreApi: useDialogStoreApi } = createScopedStoreHook(
  createDialogStore(useQuestStore, dialogRuntimeAdapter), () => useGaesupRuntime()?.dialogStore,
);
