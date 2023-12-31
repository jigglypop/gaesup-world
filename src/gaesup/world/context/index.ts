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
  characterCollider: {
    halfHeight: 0.35,
    height: 0.7,
    radius: 0.3,
    diameter: 0.6,
    riderOffsetX: 0,
    riderOffsetY: 0,
    riderOffsetZ: 0,
  },
  vehicleCollider: {
    wheelSizeX: 0.5,
    wheelSizeY: 0.5,
    wheelSizeZ: 0.5,
    vehicleSizeX: 1,
    vehicleSizeY: 1,
    vehicleSizeZ: 1,
    vehicleX: 0.5,
    vehicleY: 0.5,
    vehicleZ: 0.5,
  },
  airplaneCollider: {
    airplaneSizeX: 1,
    airplaneSizeY: 1,
    airplaneSizeZ: 1,
    airplaneX: 0.5,
    airplaneY: 0.5,
    airplaneZ: 0.5,
    gravity: 0.2,
  },
  mode: {},
  url: {
    characterUrl: null,
    vehicleUrl: null,
    airplaneUrl: null,
    wheelUrl: null,
  },
  characterGltf: null,
  vehicleGltf: null,
  wheelGltf: null,
  airplaneGltf: null,
  states: {
    isMoving: false,
    isNotMoving: false,
    isOnTheGround: false,
    isOnMoving: false,
    isRotated: false,
    isRunning: false,
    isJumping: false,
    isRiding: false,
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
  animations: {
    current: "idle",
    animationNames: {
      idle: "idle",
      walk: "walk",
      run: "run",
      accel: "accel",
      break: "break",
      ride: "ride",
      jump: "jump",
      jumpIdle: "jumpIdle",
      jumpLand: "jumpLand",
      fall: "fall",
      land: "land",
      sit: "sit",
    },
    keyControl: {},
    store: {},
    default: "idle",
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
    initDistance: -5,
    maxDistance: -7,
    minDistance: -0.7,
    initDir: 0,
    collisionOff: 0.7,
    distance: -1,
    camFollow: 11,
    XZDistance: 20,
    XDistance: 20,
    YDistance: 10,
    ZDistance: 20,
  },
  moveTo: null,
  cameraBlock: false,
  controlBlock: false,
  scrollBlock: true,
  rideable: {},
};

export const GaesupWorldContext = createContext<gaesupWorldContextType>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<gaesupWorldContextType>>(null);
