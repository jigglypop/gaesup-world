import { euler, quat, vec3 } from "@react-three/rapier";
import { createContext } from "react";
import { dispatchType } from "../../utils/type";
import { V3 } from "../../utils/vector";
import { gaesupWorldContextType } from "./type";

export const gaesupWorldDefault: gaesupWorldContextType = {
  activeState: {
    position: V3(0, 1, 5),
    impulse: vec3(),
    velocity: vec3(),
    acceleration: vec3(),
    quat: quat(),
    euler: euler(),
    rotation: euler(),
    dir: vec3(),
    direction: vec3(),
  },
  mode: {},
  urls: {
    characterUrl: null,
    vehicleUrl: null,
    airplaneUrl: null,
    wheelUrl: null,
  },
  states: {
    rideableId: null,
    isMoving: false,
    isNotMoving: false,
    isOnTheGround: false,
    isOnMoving: false,
    isRotated: false,
    isRunning: false,
    isJumping: false,
    enableRiding: false,
    isRiderOn: false,
    isLanding: false,
    isPush: {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
    },
  },
  debug: false,
  minimap: {
    props: {},
  },
  joystick: {
    joyStickOrigin: {
      x: 0,
      y: 0,
      angle: Math.PI / 2,
      currentRadius: 0,
      originRadius: 0,
      isIn: true,
      isOn: false,
      isUp: true,
      isCenter: true,
    },
    joyStickBall: {
      top: "50%",
      left: "50%",
    },
  },
  control: {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
  },
  refs: null,
  animationState: {
    character: {
      current: "idle",
      default: "idle",
      store: {},
    },
    vehicle: {
      current: "idle",
      default: "idle",
      store: {},
    },
    airplane: {
      current: "idle",
      default: "idle",
      store: {},
    },
  },
  keyBoardMap: [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "space", keys: ["Space"] },
    { name: "shift", keys: ["Shift"] },
    { name: "keyZ", keys: ["KeyZ"] },
  ],
  cameraOption: {
    offset: V3(-10, -10, -10),
    maxDistance: -7,
    distance: -1,
    XDistance: 20,
    YDistance: 10,
    ZDistance: 20,
  },
  moveTo: null,
  rideable: {},
  sizes: {},
  block: {
    camera: false,
    control: false,
    scroll: true,
  },
  callback: {
    moveTo: null,
  },
};

export const GaesupWorldContext = createContext<gaesupWorldContextType>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<gaesupWorldContextType>>(null);
