import { Ref } from "react";
import { Object3D, Object3DEventMap } from "three";
import { animationTagType, groundRayType } from "../controller/type";
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
export declare function usePlayActions(): {
    resultRef: {
        character: playResultType;
        vehicle: playResultType;
        airplane: playResultType;
    };
    play: (tag: keyof animationTagType) => void;
    setAnimationName: (actions: actionsType) => void;
};
export default function playCharacterActions({ groundRay }: playActionsType): {
    ref: Ref<Object3D<Object3DEventMap>>;
};
