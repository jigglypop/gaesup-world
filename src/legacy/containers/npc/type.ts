import { n3 } from "@store/update/type";

export type tileObjectType = {
  id: string;
  map_text: string;
  position: n3;
  tile_parent_id: number;
  color: string;
};
