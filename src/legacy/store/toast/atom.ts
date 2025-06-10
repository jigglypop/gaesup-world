"use client";

import { toastRecipeType } from "@components/toast/type";
import { atomWithReset } from "jotai/utils";

export type toastType = {
  id: string;
  text: string;
  type?: toastRecipeType;
};

export type toastAtomType = {
  toasts: {
    [x: string]: toastType;
  };
};

export const toastAtom = atomWithReset<toastAtomType>({
  toasts: {},
});
toastAtom.debugLabel = "toast";
