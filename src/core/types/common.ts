import * as THREE from 'three';

export type Vector3Tuple = [number, number, number];
export type QuaternionTuple = [number, number, number, number];
export type PlainDataValue = object | string | number | boolean | null | undefined;

export type ThreeEvent = THREE.Event & {
  object?: THREE.Object3D;
  point?: THREE.Vector3;
  distance?: number;
  delta?: number;
  stopPropagation?: () => void;
};

export type ClickEvent = ThreeEvent & {
  button?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export type CollisionEvent = {
  objectId: string;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  impulse?: number;
  other?: {
    objectId: string;
    type: string;
  };
};

export type ConfigValue = string | number | boolean | Vector3Tuple | QuaternionTuple | Record<string, PlainDataValue>;

export type GenericConfig = Record<string, ConfigValue>;

export type DebugValue = string | number | boolean | THREE.Vector3 | THREE.Quaternion | THREE.Euler;

export type PayloadData = {
  type: string;
  data?: Record<string, PlainDataValue>;
  timestamp?: number;
};

export type CallbackFunction<T = void> = (...args: Array<PlainDataValue | bigint | symbol>) => T;

export type CleanupFunction = () => void; 
