import { create } from 'zustand';

import { useQuestStore } from '../../quests/stores/questStore';
import { DialogRunner } from '../core/DialogRunner';
import { getDialogRegistry } from '../registry/DialogRegistry';
import type { DialogContext, DialogNode, DialogTreeId } from '../types';

type DialogState = {
  runner: DialogRunner | null;
  node: DialogNode | null;
  npcId?: string;

  start: (
    treeId: DialogTreeId,
    options?: {
      context?: DialogContext;
      onOpenShop?: (shopId?: string) => void;
      onCustomEffect?: (effect: { type: 'custom'; key: string; payload?: unknown }) => void;
    },
  ) => boolean;
  advance: () => void;
  choose: (index: number) => void;
  close: () => void;
};

export const useDialogStore = create<DialogState>((set, get) => ({
  runner: null,
  node: null,
  npcId: undefined,

  start: (treeId, options) => {
    const tree = getDialogRegistry().get(treeId);
    if (!tree) return false;
    const runner = new DialogRunner({
      tree,
      context: options?.context,
      onCustomEffect: options?.onCustomEffect,
      onOpenShop: options?.onOpenShop,
    });
    set({ runner, node: runner.current, npcId: options?.context?.npcId });
    if (options?.context?.npcId) useQuestStore.getState().notifyTalk(options.context.npcId);
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
