import { Ref } from "react";
import * as THREE from "three";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
  Object3DEventMap,
} from "three";
import { groundRayType } from "../controller/type";

export type Api<T extends AnimationClip> = {
  ref: React.MutableRefObject<Object3D | undefined | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: T["name"][];
  actions: {
    [key in T["name"]]: AnimationAction | null;
  };
};

export type playActionsType = {
  type: "character" | "vehicle" | "airplane";
  currentAnimation?: string;
  actions: actionsType;
  animationRef: Ref<Object3D<Object3DEventMap>>;
  isActive: boolean;
};

export type subscribeActionsType = {
  type: "character" | "vehicle" | "airplane";
  groundRay: groundRayType;
  animations: AnimationClip[];
};

export type actionsType = {
  [x: string]: THREE.AnimationAction | null;
};

export type playResultType = {
  actions: actionsType;
  ref: Ref<Object3D<Object3DEventMap>>;
};
