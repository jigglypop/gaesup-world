import { gaesupWorldContextType } from "./type";
export declare function gaesupWorldReducer(props: gaesupWorldContextType, action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
}): {
    activeState: import("./type").activeStateType;
    characterCollider: import("./type").characterColliderType;
    vehicleCollider: import("./type").vehicleColliderType;
    airplaneCollider: import("./type").airplaneColliderType;
    mode: import("./type").modeType;
    url: import("./type").urlType;
    characterGltf: import("../../component/gltf/type").GLTFResult;
    vehicleGltf: import("../../component/gltf/type").GLTFResult;
    wheelGltf: import("../../component/gltf/type").GLTFResult;
    airplaneGltf: import("../../component/gltf/type").GLTFResult;
    states: import("./type").statesType;
    debug: boolean;
    minimap: import("../../tools/minimap/type").minimapInnerType;
    joystick: import("../../tools/joystick/type").joyStickInnerType;
    control: {
        [x: string]: boolean;
    };
    points: import("./type").pointsType;
    refs: import("../../controller/type").refsType;
    animations: import("./type").animationPropType;
    keyBoardMap: import("../../tools/keyBoardToolTip/type").keyboardMapType;
};
