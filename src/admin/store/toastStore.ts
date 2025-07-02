import { create } from 'zustand';

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

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  timers: new Map(),
  addToast: (toast) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    set(state => ({ toasts: [...state.toasts, newToast] }));
    
    const timer = setTimeout(() => {
      get().removeToast(id);
    }, 3000);
    
    set(state => {
      state.timers.set(id, timer);
      return {};
    });
  },
  addToastAsync: async (toast) => {
    return new Promise((resolve) => {
      get().addToast(toast);
      resolve();
    });
  },
  removeToast: (id) => {
    const { timers } = get();
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
  },
})); 