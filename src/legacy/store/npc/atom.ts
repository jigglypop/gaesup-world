import { getDefaultThreeObject } from "@store/threeObject/atom";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { npcAtomType, npcUpdateType } from "./type";

export const defaultNpc: npcUpdateType = {
  npc_id: "-1",
  username: "",
  current_animation: "idle",
  modal_name: null,
  link_url: null,
  info: null,
  body: {
    ...getDefaultThreeObject({
      object_type: "body",
    }),
  },
  clothes: null,
  glass: null,
  hat: null,
  left_hand: null,
  right_hand: null,
};

export const npcAtom = atom<npcAtomType>({
  npc_id: null,
  npc: defaultNpc,
  type: "create",
  npcsById: {},
  delete: {},
  update: {},
  create: {},
});

export const resetNpcAtom = atomWithDefault((get) => get(npcAtom));

npcAtom.debugLabel = "npc";
