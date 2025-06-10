import { toastRecipeType } from "@components/toast/type";
import { toastAtom } from "@store/toast/atom";
import { useAtom } from "jotai";
import { useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useAtom(toastAtom);

  const setToastInner = ({
    text,
    type,
  }: {
    text: string;
    type?: toastRecipeType;
  }) => {
    const id = Date.now().toString();
    setToasts((prev) => {
      return {
        ...prev,
        toasts: {
          ...prev.toasts,
          [id]: {
            id,
            text,
            type,
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
  };

  const addToast = useCallback(setToastInner, [setToasts]);
  const addToastAsync = useCallback(
    async ({ text, type }: { text: string; type?: toastRecipeType }) => {
      setToastInner({ text, type });
    },
    [setToasts]
  );

  return {
    toasts,
    setToasts,
    addToast,
    addToastAsync,
  };
};
