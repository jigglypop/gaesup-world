import { createContext } from "react";
import { dispatchType } from "../../utils/type";
import { V3 } from "../../utils/vector";
import { gaesupControllerType, perspectiveCameraType } from "./type";

export const gaesupControllerDefault = {
  cameraMode: {
    cameraType: "perspective" as "perspective",
    controlType: "normal" as "normal",
  } as perspectiveCameraType,
  cameraOption: {
    offset: V3(-10, -10, -10),
    initDistance: -5,
    maxDistance: -7,
    minDistance: -0.7,
    initDir: 0,
    collisionOff: 0.7,
    distance: -1,
    camFollow: 11,
  },
  perspectiveCamera: {
    isFront: true,
    XZDistance: 8,
    XDistance: 8,
    YDistance: 1,
    ZDistance: 8,
  },
  airplane: {
    angleDelta: V3(Math.PI / 256, Math.PI / 256, Math.PI / 256),
    maxAngle: V3(Math.PI / 8, Math.PI / 8, Math.PI / 8),
    maxSpeed: 60,
    accelRatio: 2,
    brakeRatio: 5,
    buoyancy: 0.2,
    linearDamping: 1,
  },
  vehicle: {
    maxSpeed: 60,
    accelRatio: 2,
    brakeRatio: 5,
    wheelOffset: 0.1,
    linearDamping: 0.5,
  },
  character: {
    walkSpeed: 10,
    runSpeed: 20,
    turnSpeed: 10,
    jumpSpeed: 1,
    linearDamping: 1,
  },
  callbacks: {
    onReady: () => {},
    onFrame: () => {},
    onDestory: () => {},
    onAnimate: () => {},
  },
  refs: {
    capsuleColliderRef: null,
    rigidBodyRef: null,
    outerGroupRef: null,
    innerGroupRef: null,
    slopeRayOriginRef: null,
    characterInnerRef: null,
  },
  isRider: false,
};

export const GaesupControllerContext = createContext<gaesupControllerType>({
  ...gaesupControllerDefault,
});
export const GaesupControllerDispatchContext =
  createContext<dispatchType<gaesupControllerType>>(null);
