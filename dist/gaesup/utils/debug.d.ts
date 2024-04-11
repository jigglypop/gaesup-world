import * as THREE from "three";
type valueType = string | boolean | number | THREE.Vector3 | THREE.Quaternion | THREE.Euler;
type constantType = {
    [key: string]: valueType;
};
type changeDebugMapItem = {
    min: number;
    max: number;
    step: number;
};
type chagneDebugVectorMapItem = {
    x: changeDebugMapItem;
    y: changeDebugMapItem;
    z: changeDebugMapItem;
};
type changeDebugOptionItem = {
    options: string[];
};
type changeDebugMapType<T> = {
    [K in keyof T]: changeDebugMapItem | chagneDebugVectorMapItem | changeDebugOptionItem;
};
export type debugPropType<T extends constantType> = {
    debug: boolean;
    tag: string;
    debugProps: T;
} & {
    debugMap: changeDebugMapType<T>;
};
export default function debug<T extends constantType>(props: debugPropType<T>): T;
export {};
