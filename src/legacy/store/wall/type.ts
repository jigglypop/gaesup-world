import { n3 } from "@store/update/type";

export type wallType = {
  id: string | null;
  position: n3;
  rotation: n3;
  wall_parent_id: string | null;
};

export type wallAtomType = {
  type: "update" | "delete" | "create";
  current: wallType | null;
  update: { [key: string]: wallType };
  create: { [key: string]: wallType };
  delete: { [key: string]: wallType };
};

export interface IWallType {}
