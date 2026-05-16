import * as THREE from 'three';
import { FocusableObjectProps } from './types';
export declare function unfocusCamera(): void;
export declare const FocusableObject: import("react").ForwardRefExoticComponent<Omit<FocusableObjectProps, "ref"> & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
