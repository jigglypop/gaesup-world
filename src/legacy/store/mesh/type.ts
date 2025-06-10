export type meshTypeString = "none" | "wall" | "floor" | "ceiling";

export type meshType = {
  mesh_id: string | null;
  material: string;
  color: string;
  map_texture_url: string;
  normal_texture_url: string;
  mesh_type: meshTypeString;
  // id
  tile_parent_id: string | null;
  wall_parent_id: string | null;
};

export type meshMap = {
  [key: string]: meshType;
};

export type meshAtomType = {
  type: "update" | "delete" | "create" | "origin";
  tapName: "기존" | "신규";
  current_id?: string | null;
  current: meshType | null;
  mesh_list: {
    [key: string]: string;
  };
};
