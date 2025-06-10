import { CloneProps } from "@react-three/drei";
import {
  RigidBodyAutoCollider,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { meshType } from "@store/mesh/type";
import { n3 } from "@store/update/type";
import { wallParentType } from "@store/wallParent/type";
import * as THREE from "three";
import { nodesType } from "types";

export type GltfProps = Omit<JSX.IntrinsicElements["group"], "children"> &
  Omit<CloneProps, "object"> & {
    src: string;
  };

export type wallTypeString = "all" | "blockA" | "blockB" | "none";

export type commonObjectItemType = {
  // 공통
  name?: string;
  // object
  collideable?: boolean;
  wall_type?: wallTypeString;
  object_type?: string;
  object_name?: string;
  gltf_url: string;
  colliders: RigidBodyAutoCollider;
  rigid_body_type: RigidBodyTypeString;
  // 모달
  modal_name?: string;
  // 포스터, 이미지, 링크
  image_url?: string;
  link_url?: string;
  // html
  text?: string;
  // 타일
  count?: [number, number, number];
  color?: string;
  // 기타
  // update
  isUpdate?: boolean;
  // update modal
  isUpdateModal?: boolean;
};

export type commonStateType = {
  position: THREE.Vector3 | n3;
  rotation: THREE.Euler | n3;
  scale: n3;
};

export type commonStateRequestType = {
  position: n3;
  rotation: n3;
  scale: n3;
};

export type commonObjectType = commonObjectItemType &
  commonStateType & {
    mesh?: meshType;
    three_object_id: string;
  };
export type objectRequestType = commonObjectItemType & commonStateRequestType;

export type objectType = {
  nodes?: nodesType;
  texture?: THREE.Texture;
  hover?: boolean;
  isOpen?: boolean;
  map_text?: string;
  modalType?: string;
} & commonObjectType;

export type wallObjectType = objectType & {
  wallParent?: wallParentType | null;
};
// @store/npc/type.ts

export interface threeObject {
  gltf_url?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  // 기타 필요한 속성들...
}

export interface npcType {
  threeObjects: threeObject[];
  username?: string;
  npc_id?: string;
  current_animation?: string;
  isUpdate?: boolean;
  isEditor?: boolean;
  info?: string;
}
