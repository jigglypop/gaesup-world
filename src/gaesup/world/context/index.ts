import { euler, quat, vec3 } from "@react-three/rapier";
import { createContext } from "react";
import { animationTagType } from "../../controller/type";
import { V3 } from "../../utils/vector";
import { dispatchType, gaesupWorldPropType } from "./type";

export const gaesupWorldDefault: gaesupWorldPropType = {
  activeState: {
    position: V3(0, 1, 5),
    impulse: vec3(),
    velocity: vec3(),
    acceleration: vec3(),
    quat: quat(),
    euler: euler(),
    dir: vec3(),
    direction: vec3(),
    axisX: V3(1, 0, 0),
    axisY: V3(0, 1, 0),
    axisZ: V3(0, 0, 1),
    yaw: 0,
    pitch: 0,
    roll: 0,
  },
  characterCollider: {
    halfHeight: 0.35,
    height: 0.7,
    radius: 0.3,
    diameter: 0.6,
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
  },
  mode: {
    type: "character",
    controller: "keyboard",
  },
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
    isAnimationOuter: false,
  },
  debug: false,
  minimap: {
    on: true,
    props: {},
  },
  joystick: {
    on: true,
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
  points: [],
  refs: null,
  animations: {
    current: "idle" as keyof animationTagType,
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
    },
    keyControl: {},
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
};

export const GaesupWorldContext = createContext<gaesupWorldPropType>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<gaesupWorldPropType>>(null);