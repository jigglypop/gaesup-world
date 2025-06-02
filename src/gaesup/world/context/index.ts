import { euler, quat, vec3 } from '@react-three/rapier';
import { createContext } from 'react';
import { dispatchType } from '../../utils/type';
import { V3 } from '../../utils/vector';
import { gaesupWorldContextType } from './type';

export const gaesupWorldDefault: gaesupWorldContextType = {
  activeState: {
    position: V3(0, 5, 5),
    velocity: vec3(),
    quat: quat(),
    euler: euler(),
    dir: vec3(),
    direction: vec3(),
  },
  mode: {},
  urls: {
    characterUrl: null,
    vehicleUrl: null,
    airplaneUrl: null,
    wheelUrl: null,
    ridingUrl: null,
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
    isFalling: false,
    isRiding: false,
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
  refs: null,
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
};

export const GaesupWorldContext = createContext<Partial<gaesupWorldContextType>>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<Partial<gaesupWorldContextType>>>(null);
