import { createContext } from "react";
import { dispatchType } from "../../utils/type";
import { V3 } from "../../utils/vector";
import { gaesupControllerType } from "./type";

export const gaesupControllerDefault = {
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
    colliderRef: null,
    rigidBodyRef: null,
    outerGroupRef: null,
    innerGroupRef: null,
    characterInnerRef: null,
  },
  urls: {
    airplaneUrl: null,
    vehicleUrl: null,
    characterUrl: null,
    wheelUrl: null,
  },
};

export const GaesupControllerContext = createContext<gaesupControllerType>({
  ...gaesupControllerDefault,
});
export const GaesupControllerDispatchContext =
  createContext<dispatchType<gaesupControllerType>>(null);
