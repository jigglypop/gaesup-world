import { create } from 'zustand';

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
  push: (t: Omit<Toast, 'id' | 'createdAt' | 'durationMs'> & { durationMs?: number }) => number;
  dismiss: (id: number) => void;
  clear: () => void;
};

let _seq = 0;

export const useToastStore = create<State>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++_seq;
    const toast: Toast = {
      id,
      createdAt: Date.now(),
      durationMs: t.durationMs ?? 3500,
      kind: t.kind,
      text: t.text,
      ...(t.icon ? { icon: t.icon } : {}),
    };
    set({ toasts: [...get().toasts, toast] });
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}));

export function notify(kind: ToastKind, text: string, opts?: { icon?: string; durationMs?: number }): number {
  return useToastStore.getState().push({
    kind,
    text,
    ...(opts?.icon ? { icon: opts.icon } : {}),
    ...(opts?.durationMs !== undefined ? { durationMs: opts.durationMs } : {}),
  });
}
