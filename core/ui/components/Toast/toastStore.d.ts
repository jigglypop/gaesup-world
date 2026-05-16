export type ToastKind = 'info' | 'success' | 'warn' | 'error' | 'reward' | 'mail';
export type Toast = {
    id: number;
    kind: ToastKind;
    text: string;
    icon?: string;
    durationMs: number;
    createdAt: number;
};
type State = {
    toasts: Toast[];
    push: (t: Omit<Toast, 'id' | 'createdAt' | 'durationMs'> & {
        durationMs?: number;
    }) => number;
    dismiss: (id: number) => void;
    clear: () => void;
};
export declare const useToastStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export declare function notify(kind: ToastKind, text: string, opts?: {
    icon?: string;
    durationMs?: number;
}): number;
export {};
