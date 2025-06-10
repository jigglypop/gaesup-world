import { n3 } from "@store/update/type";

export type tileType = {
  id: string;
  collideable?: boolean;
  position: n3;
  tile_parent_id: string | null;
  color?: string;
};

export type tilesByParentsIdType = { [key: string]: tileType[] };

export type tileAtomType = {
  type: "update" | "delete" | "create";
  current: tileType | null;
  update: { [key: string]: tileType };
  create: { [key: string]: tileType };
  delete: { [key: string]: tileType };
  tilesByParentsId: tilesByParentsIdType;
};
