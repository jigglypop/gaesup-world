import type { DialogChoice, DialogContext, DialogEffect, DialogNode, DialogTree } from '../types';
export type DialogRunnerOptions = {
    tree: DialogTree;
    context?: DialogContext;
    onCustomEffect?: (effect: Extract<DialogEffect, {
        type: 'custom';
    }>) => void;
    onOpenShop?: (shopId?: string) => void;
};
export declare class DialogRunner {
    readonly tree: DialogTree;
    readonly context: DialogContext;
    private currentId;
    private onCustomEffect?;
    private onOpenShop?;
    constructor(opts: DialogRunnerOptions);
    get current(): DialogNode | null;
    isFinished(): boolean;
    visibleChoices(): DialogChoice[];
    advance(): DialogNode | null;
    choose(index: number): DialogNode | null;
    private checkCondition;
    private applyEffect;
}
