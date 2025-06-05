import { euler, quat, vec3 } from '@react-three/rapier';
import { createContext } from 'react';
import { dispatchType } from '../../utils/type';
import { V3 } from '../../utils/vector';
import { gaesupWorldContextType } from './type';

export const gaesupWorldDefault: Partial<gaesupWorldContextType> = {
  activeState: {
    position: V3(0, 5, 5),
    velocity: vec3(),
    quat: quat(),
    euler: euler(),
    dir: vec3(),
    direction: vec3(),
  },
  mode: {
    type: 'character',
    controller: 'clicker',
    control: 'thirdPersonOrbit',
  },
  urls: {
    characterUrl: '',
    vehicleUrl: '',
    airplaneUrl: '',
    wheelUrl: '',
    ridingUrl: '',
  },
  states: {
    rideableId: '',
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
    isFalling: false,
    isRiding: false,
    canRide: false,
    nearbyRideable: null,
    shouldEnterRideable: false,
    shouldExitRideable: false,
  },
  clicker: {
    point: V3(0, 0, 0),
    angle: Math.PI / 2,
    isOn: false,
    isRun: false,
  },
  control: {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
  },
  animationState: {
    character: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
    vehicle: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
    airplane: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
  },
  rideable: {},
  sizes: {},
  block: {
    camera: false,
    control: false,
    animation: false,
    scroll: true,
  },
  clickerOption: {
    isRun: true,
    throttle: 100,
    autoStart: false,
    track: false,
    loop: false,
    queue: [],
    line: false,
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
    jumpSpeed: 15,
    linearDamping: 1,
    jumpGravityScale: 1.5,
    normalGravityScale: 1.0,
    airDamping: 0.1,
    stopDamping: 3,
  },
  callbacks: {
    onReady: () => {},
    onFrame: () => {},
    onDestory: () => {},
    onAnimate: () => {},
  },
  controllerOptions: {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1,
    },
  },
};

export const GaesupWorldContext =
  createContext<Partial<gaesupWorldContextType>>(gaesupWorldDefault);
export const GaesupWorldDispatchContext = createContext<
  dispatchType<Partial<gaesupWorldContextType>>
>(() => {});
