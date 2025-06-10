import { atom } from "jotai";
import { saveRoomAtomType } from "./type";

export const saveRoomAtom = atom<saveRoomAtomType>({
  wall: {
    update: [],
    create: [],
    delete: [],
  },
  tile: {
    update: [],
    create: [],
    delete: [],
  },
  threeObject: {
    update: [],
    create: [],
    delete: [],
  },
  npc: {
    update: [],
    create: [],
    delete: [],
  },
});

saveRoomAtom.debugLabel = "save_room";
