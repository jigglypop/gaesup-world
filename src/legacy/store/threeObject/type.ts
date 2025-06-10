import { n3 } from "@store/update/type";

export type directionEnumType = "W" | "E" | "S" | "N";

export type BaseThreeObject = {
  three_object_id?: string;
  gltf_url?: string | null;
  object_type: string;
  object_name: string;
  colliders?: string;
  rigid_body_type?: string;
  link_url?: string | null;
  count?: n3;
  position?: n3;
  rotation?: n3;
  scale?: n3;
  npc_id?: string | null;
  color?: string | null;
  pamplet_url?: string | null;
  poster_url?: string | null;
  direction?: directionEnumType;
};

export type threeObjectType = BaseThreeObject & {
  collideable?: boolean;
  wall_type?: any;
  isUpdate?: boolean;
  isEditor?: boolean;
};

export type threeObjectRequestType = Partial<
  Omit<BaseThreeObject, "count" | "scale" | "collideable">
> & {
  count?: n3;
  scale?: n3;
  object_type: string;
  object_name: string;
};

export type threeObjectAtomType = {
  type: "update" | "delete" | "create";
  current: threeObjectType | null;
  itemType: {
    color: boolean;
    pamplet_url: boolean;
    poster_url: boolean;
  };
  update: { [key: string]: threeObjectRequestType };
  create: { [key: string]: threeObjectRequestType };
  delete: string[];
  threeObjectsById: { [key: string]: threeObjectType[] };
};

export type threeObjectResponseType = threeObjectType[];
