interface ToastItem {
    id: string;
    text: string;
    type?: 'success' | 'error' | 'info';
}
interface ToastState {
    toasts: ToastItem[];
    timers: Map<string, NodeJS.Timeout>;
    addToast: (toast: Omit<ToastItem, 'id'>) => void;
    addToastAsync: (toast: Omit<ToastItem, 'id'>) => Promise<void>;
    removeToast: (id: string) => void;
}
export declare const useToast: import("zustand").UseBoundStore<import("zustand").StoreApi<ToastState>>;
export {};
