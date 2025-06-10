import { ANIMATION_MAP } from "@constants/main";
import { threeObjectType } from "@store/threeObject/type";
import { defaultNpc } from "./atom";

export type npcState = {
  npc: typeof defaultNpc | null;
};

export type npcUpdateType = {
  npc_id: string;
  username: string | null;
  current_animation: string | null;
  modal_name: string | null;
  link_url: string | null;
  info: string | null;
  body: threeObjectType;
  clothes: threeObjectType | null;
  glass: threeObjectType | null;
  hat: threeObjectType | null;
  right_hand: threeObjectType | null;
  left_hand: threeObjectType | null;
  current?: {
    position: n3;
    rotation: n3;
    scale: n3;
  };
};

export type npcType = {
  npc_id: string;
  current_animation: string | null;
  username: string | null;
  modal_name: string | null;
  link_url: string | null;
  info: string | null;
  threeObjects: threeObjectType[];
  isUpdate?: boolean;
  isThumbNail?: boolean;
};

export type npcAndThreeObjectsResponseType = {
  npcs: npcType[];
  threeObjects: threeObjectType[];
};

export type npcRequestType = {
  npc_id: string | null;
  current_animation: keyof typeof ANIMATION_MAP;
  username: string | null;
  modal_name: string | null;
  link_url: string | null;
  info: string | null;
  threeObjects: threeObjectType[];
};

export type npcResponseType = {
  npcs: npcType[];
};

export type npcAtomType = {
  npc_id: string | null;
  npc: npcUpdateType;
  type: "delete" | "create" | "update";
  npcsById: {
    [key: string]: npcType[];
  };
  delete: {
    [key: string]: npcType;
  };
  update: {
    [key: string]: npcType;
  };
  create: {
    [key: string]: npcType;
  };
};

export type n3 = [number, number, number];
export type npcKeyType = keyof npcAtomType;
