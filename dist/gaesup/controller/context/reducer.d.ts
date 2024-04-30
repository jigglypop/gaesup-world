import { gaesupControllerType } from "./type";
export declare function gaesupControllerReducer(props: gaesupControllerType, action: {
    type: string;
    payload?: Partial<gaesupControllerType>;
}): {
    airplane: import("./type").airplaneType;
    vehicle: import("./type").vehicleType;
    character: import("./type").characterType;
    controllerOptions: import("../type").controllerOptionsType;
    callbacks?: import("../initialize/callback/type").callbackType;
    refs?: import("../type").refsType;
};
