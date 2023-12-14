import { Dispatch } from "react";
import { GLTFResult } from "../../component/gltf/type";
import { actionsType, animationTagType, refsType } from "../../controller/type";
import { joyStickInnerType } from "../../tools/joystick/type";
import { minimapInnerType } from "../../tools/minimap/type";
import { keyboardMapType } from "../../tools/type";
export type controlType = {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
    [key: string]: boolean;
};
export type keyControlType = {
    [key: string]: boolean;
};
export type pointType = {
    text: string;
    position: THREE.Vector3;
};
export type pointsType = pointType[];
export type statesType = {
    isMoving: boolean;
    isNotMoving: boolean;
    isOnTheGround: boolean;
    isOnMoving: boolean;
    isRotated: boolean;
    isRunning: boolean;
    isJumping: boolean;
    isAnimationOuter: boolean;
};
export type urlType = {
    characterUrl?: string;
    vehicleUrl?: string;
    airplaneUrl?: string;
    wheelUrl?: string;
};
export type animationPropType = {
    current: keyof animationTagType;
    animationNames: actionsType;
    keyControl: {
        [key: string]: boolean;
    };
};
export type characterColliderType = {
    halfHeight?: number;
    height?: number;
    radius?: number;
    diameter?: number;
};
export type vehicleColliderType = {
    wheelSizeX?: number;
    wheelSizeY?: number;
    wheelSizeZ?: number;
    vehicleSizeX?: number;
    vehicleSizeY?: number;
    vehicleSizeZ?: number;
    vehicleX?: number;
    vehicleY?: number;
    vehicleZ?: number;
};
export type airplaneColliderType = {
    airplaneSizeX?: number;
    airplaneSizeY?: number;
    airplaneSizeZ?: number;
    airplaneX?: number;
    airplaneY?: number;
    airplaneZ?: number;
};
export type modeType = {
    type?: "character" | "vehicle" | "airplane";
    controller?: "gameboy" | "keyboard" | "joystick";
};
export type activeStateType = {
    position: THREE.Vector3;
    impulse: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    quat: THREE.Quaternion;
    euler: THREE.Euler;
    direction: THREE.Vector3;
    dir: THREE.Vector3;
    axisX: THREE.Vector3;
    axisY: THREE.Vector3;
    axisZ: THREE.Vector3;
    yaw: number;
    pitch: number;
    roll: number;
};
type KeyboardControlsState<T extends string = string> = {
    [K in T]: boolean;
};
export type gaesupWorldPropType = {
    activeState: activeStateType;
    characterCollider: characterColliderType;
    vehicleCollider: vehicleColliderType;
    airplaneCollider: airplaneColliderType;
    mode: modeType;
    url: urlType;
    characterGltf: GLTFResult;
    vehicleGltf: GLTFResult;
    wheelGltf: GLTFResult;
    airplaneGltf: GLTFResult;
    states: statesType;
    debug: boolean;
    minimap: minimapInnerType;
    joystick: joyStickInnerType;
    control: KeyboardControlsState<string>;
    points: pointsType;
    refs: refsType;
    animations: animationPropType;
    keyBoardMap: keyboardMapType;
};
export type dispatchType<T> = Dispatch<{
    type: string;
    payload?: Partial<T>;
}>;
export type gaesupWorldPartialPropType = Partial<gaesupWorldPropType>;
export type gaesupDisptachType = Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
}>;
export {};
