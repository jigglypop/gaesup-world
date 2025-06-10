import { atom } from "jotai";

export type loadingAtomType = {
  isLoading: boolean;
};

export const loadingAtom = atom<loadingAtomType>({
  isLoading: false,
});

loadingAtom.debugLabel = "loading";
