import type { DialogTree, DialogTreeId } from '../types';
declare class DialogRegistry {
    private trees;
    register(tree: DialogTree): void;
    registerAll(trees: DialogTree[]): void;
    get(id: DialogTreeId): DialogTree | undefined;
    require(id: DialogTreeId): DialogTree;
    has(id: DialogTreeId): boolean;
    clear(): void;
}
export declare function getDialogRegistry(): DialogRegistry;
export type { DialogRegistry };
