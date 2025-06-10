import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { objectTypeString, updateRoomAtomType } from "./type";

export const OBJECT_TYPE: objectTypeString[] = [
  "normal",
  "npc",
  "tile",
  "wall",
  "portal",
];

export const updateRoomAtom = atom<updateRoomAtomType>({
  type: "create",
  object_type: "normal",
  height: 0,
  option: {
    move: true,
    turn: false,
    point: false,
    outer: false,
    inner: false,
  },
  current: null,
  delete: {},
  update: {},
  create: {},
});

export const resetUpdateRoomAtom = atomWithDefault((get) =>
  get(updateRoomAtom)
);

updateRoomAtom.debugLabel = "update_room";
