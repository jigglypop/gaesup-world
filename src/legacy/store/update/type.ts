import { GroupProps } from "@react-three/fiber";
import {
  RigidBodyAutoCollider,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { threeObjectType } from "@store/threeObject/type";
import * as THREE from "three";

export type objectTypeString = "normal" | "npc" | "tile" | "wall" | "portal";

export type updateRoomAtomType = {
  type: "update" | "delete" | "create";
  object_type: objectTypeString;
  height: number;
  option: {
    move: boolean;
    turn: boolean;
    point: boolean;
    outer: boolean;
    inner: boolean;
  };
  current: threeObjectType | null;
  delete: {
    [key: string]: threeObjectType;
  };
  update: {
    [key: string]: threeObjectType;
  };
  create: {
    [key: string]: threeObjectType;
  };
};

export interface groupPropsType extends GroupProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: n3;
}

export type currentRoomType = {
  name?: string;
  gltf_name: string;
  collider?: RigidBodyAutoCollider;
  rigid_body_type?: RigidBodyTypeString;
  color?: string;
  object_name?: string;
  object_type?: string;
  clothes_url?: string;
  count?: n3;
  size?: n3;
  collideable?: boolean;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: n3;
};

export type n3 = [number, number, number];
export type updateRoomKeyType = keyof updateRoomAtomType;
