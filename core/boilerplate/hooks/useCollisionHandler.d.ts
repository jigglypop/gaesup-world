import type { CollisionEnterPayload, CollisionPayload } from '@react-three/rapier';
import type { RuntimeValue } from '../types';
export type CollisionHandlerArg = CollisionPayload | CollisionEnterPayload | CollisionUserData | undefined;
export type CollisionHandlerFn = (...args: CollisionHandlerArg[]) => void;
export type CollisionHandlerValue = CollisionHandlerFn | RuntimeValue;
export type CollisionUserData = Record<string, CollisionHandlerValue>;
export interface CollisionHandlerOptions {
    onIntersectionEnter?: (payload: CollisionPayload) => void;
    onIntersectionExit?: (payload: CollisionPayload) => void;
    onCollisionEnter?: (payload: CollisionEnterPayload) => void;
    userData?: CollisionUserData;
}
export declare function useCollisionHandler(options: CollisionHandlerOptions): {
    handleIntersectionEnter: (payload: CollisionPayload) => void;
    handleIntersectionExit: (payload: CollisionPayload) => void;
    handleCollisionEnter: (payload: CollisionEnterPayload) => void;
};
