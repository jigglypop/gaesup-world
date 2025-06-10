"use client";
import { useToast } from "@store/toast";
import * as S from "./styles.css";
import { toastRecipeType } from "./type";

export const ToastItem = ({
  text,
  type,
}: {
  text: string;
  type?: toastRecipeType;
}) => {
  return (
    <div className={S.toastItem}>
      <div className={S.toastRecipe(type)}></div>
      <div className={S.toastItemFront}></div>
      <p className={S.text}>{text}</p>
    </div>
  );
};

export default function Toast() {
  const { toasts } = useToast();
  return (
    <div
      id="toasts"
      className={S.toast}>
      {Object.values(toasts.toasts).map((toast, i) => (
        <ToastItem
          key={i}
          text={toast.text}
          type={toast.type}
        />
      ))}
    </div>
  );
}
