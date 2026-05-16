import { DialogRunner } from '../core/DialogRunner';
import type { DialogContext, DialogEffect, DialogNode, DialogTreeId } from '../types';
type CustomDialogEffect = Extract<DialogEffect, {
    type: 'custom';
}>;
type DialogState = {
    runner: DialogRunner | null;
    node: DialogNode | null;
    npcId: string | undefined;
    start: (treeId: DialogTreeId, options?: {
        context?: DialogContext;
        onOpenShop?: (shopId?: string) => void;
        onCustomEffect?: (effect: CustomDialogEffect) => void;
    }) => boolean;
    advance: () => void;
    choose: (index: number) => void;
    close: () => void;
};
export declare const useDialogStore: import("zustand").UseBoundStore<import("zustand").StoreApi<DialogState>>;
export {};
