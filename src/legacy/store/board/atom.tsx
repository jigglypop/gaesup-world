import { atomWithStorage } from "jotai/utils";
import { boardAtomType } from "./type";

export const boardAtom = atomWithStorage<boardAtomType>("board", {
  boardMap: {},
  current: null,
});
