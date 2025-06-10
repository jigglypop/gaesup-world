import { toastAtom } from "@store/toast/atom";
import { useAtom } from "jotai";
import { useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useAtom(toastAtom);

  const addToast = useCallback(
    (text: string) => {
      const id = Date.now().toString();
      setToasts((prev) => {
        return {
          ...prev,
          toasts: {
            ...prev.toasts,
            [id]: {
              id,
              text,
            },
          },
        };
      });
      setTimeout(() => {
        setToasts((prev) => {
          const newToasts = { ...prev };
          delete newToasts.toasts[id];
          return newToasts;
        });
      }, 4000);
    },
    [setToasts]
  );
  return {
    toasts,
    setToasts,
    addToast,
  };
};
