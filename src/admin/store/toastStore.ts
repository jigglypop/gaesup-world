import { create } from 'zustand';

interface ToastItem {
  id: string;
  text: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  addToastAsync: (toast: Omit<ToastItem, 'id'>) => Promise<void>;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    set(state => ({ toasts: [...state.toasts, newToast] }));
    
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  addToastAsync: async (toast) => {
    return new Promise((resolve) => {
      get().addToast(toast);
      resolve();
    });
  },
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
  },
})); 