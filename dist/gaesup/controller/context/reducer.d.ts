import { gaesupControllerType } from "./type.js";
export declare function gaesupControllerReducer(props: gaesupControllerType, action: {
    type: string;
    payload?: gaesupControllerType;
}): {
    cameraMode: import("./type.js").gaesupCameraPropType;
    cameraOption: import("./type.js").gaesupCameraOptionType;
    perspectiveCamera: import("./type.js").perspectiveCameraPropType;
    orthographicCamera: import("@react-three/fiber").OrthographicCameraProps;
    airplane: import("./type.js").airplaneType;
    vehicle: import("./type.js").vehicleType;
    character: import("./type.js").characterType;
    isRider: boolean;
};
