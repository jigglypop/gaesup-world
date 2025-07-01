import { CloneProps } from "@react-three/drei";
import {
  RigidBodyAutoCollider,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { n3 } from "@store/update/type";
import { wallParentType } from "@store/wallParent/type";
import * as THREE from "three";
import { nodesType } from "types";

export type GltfProps = Omit<JSX.IntrinsicElements["group"], "children"> &
  Omit<CloneProps, "object"> & {
    src: string;
  };

export type commonObjectItemType = {
  // 공통
  id?: number | string;
  name?: string;
  // url
  body_url?: string;
  body_color?: string;
  hat_url?: string;
  hat_color?: string;
  clothes_url?: string;
  clothes_color?: string;
  glass_url?: string;
  glass_color?: string;
  // object
  object_type?: string;
  object_name?: string;
  start_position_delta?: [number, number, number];
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
  text_offset?: THREE.Vector3;
  // 타일
  map_text?: string;
  size?: [number, number, number];
  count?: [number, number, number];
  color?: string;
  transparent?: boolean;
  opacity?: number;
  map_texture_url?: string;
  normal_texture_url?: string;
  // npc
  message?: string;
  username?: string;
  infomation?: string;
  currentAnimation?: string;

  // update
  isUpdate?: boolean;
  // update modal
  isUpdateModal?: boolean;
};

export type commonStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: n3;
};

export type commonStateRequestType = {
  position: n3;
  rotation: n3;
  scale: n3;
};

export type commonObjectType = commonObjectItemType & commonStateType;
export type objectRequestType = commonObjectItemType & commonStateRequestType;

export type objectType = {
  nodes?: nodesType;
  texture?: THREE.Texture;
  hover?: boolean;
  isOpen?: boolean;
  map_text?: string;
  modalType?: string;
} & commonObjectType;

export type wallObjectType = {
  // 공통
  id: string;
  gltf_url: string;
  wall_type: "none" | "all" | "blockA" | "blockB";
  position: n3;
  rotation: n3;
  wallParent: wallParentType;
};
