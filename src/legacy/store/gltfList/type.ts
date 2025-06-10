import { n3 } from "@store/update/type";

export type gltfListType = {
  id: number;
  gltf: string;
  gltf_url: string;
  object_name: string;
  object_type: string;
  category: string;
  colliders: string;
  count: n3;
};

export type gltfListAtomType = {
  npc: { [key: string]: gltfListType[] };
  normal: { [key: string]: gltfListType[] };
  wall: { [key: string]: gltfListType[] };
  tile: { [key: string]: gltfListType[] };
  portal: { [key: string]: gltfListType[] };
  category: string;
  gltf_url: string | null;
};
