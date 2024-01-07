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
    characterGltf: import("../../component/type").GLTFResult;
    vehicleGltf: import("../../component/type").GLTFResult;
    wheelGltf: import("../../component/type").GLTFResult;
    airplaneGltf: import("../../component/type").GLTFResult;
    states: import("./type").statesType;
    debug: boolean;
    minimap: import("../../tools/miniMap/type").minimapInnerType;
    joystick: import("../../tools/joyStick/type").joyStickInnerType;
    control: {
        [x: string]: boolean;
    };
    refs: import("../../controller/type").refsType;
    animations: import("./type").animationPropType;
    keyBoardMap: import("../../tools/keyBoardToolTip/type").keyboardMapType;
    cameraOption: import("./type").cameraOptionType;
    moveTo: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
    cameraBlock: boolean;
    controlBlock: boolean;
    scrollBlock: boolean;
    rideable: {
        [key: string]: import("./type").rideableType;
    };
};
