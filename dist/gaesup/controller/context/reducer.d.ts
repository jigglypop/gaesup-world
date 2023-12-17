import { gaesupControllerType } from "./type";
export declare function gaesupControllerReducer(props: gaesupControllerType, action: {
    type: string;
    payload?: Partial<gaesupControllerType>;
}): {
    cameraMode: import("./type").gaesupCameraPropType;
    cameraOption: import("./type").cameraOptionType;
    perspectiveCamera: import("./type").perspectiveCameraPropType;
    orthographicCamera: import("@react-three/fiber").OrthographicCameraProps;
    airplane: import("./type").airplaneType;
    vehicle: import("./type").vehicleType;
    character: import("./type").characterType;
    isRider: boolean;
    callbacks: import("../../initial/callback/type").callbackType;
    refs: import("../type").refsType;
};
