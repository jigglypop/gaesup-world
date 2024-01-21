import { Ref } from "react";
import { Object3D, Object3DEventMap } from "three";
import { groundRayType } from "../controller/type";
export type playActionsType = {
    groundRay: groundRayType;
};
export type actionsType = {
    [x: string]: THREE.AnimationAction | null;
};
export type playResultType = {
    actions: actionsType;
    ref: Ref<Object3D<Object3DEventMap>>;
};
export declare function readyAnimation(): {
    resultRef: {
        character: playResultType;
        vehicle: playResultType;
        airplane: playResultType;
    };
};
export default function playCharacterActions({ groundRay }: playActionsType): {
    ref: Ref<Object3D<Object3DEventMap>>;
    resultRef: {
        character: playResultType;
        vehicle: playResultType;
        airplane: playResultType;
    };
};
