import { euler, quat, vec3 } from '@react-three/rapier';
import { createContext } from 'react';
import { dispatchType } from '../../utils/type';
import { V3 } from '../../utils/vector';
import { gaesupWorldContextType } from './type';

// Split contexts for better performance
export const ActiveStateContext = createContext<gaesupWorldContextType['activeState']>(null);
export const ModeContext = createContext<gaesupWorldContextType['mode']>(null);
export const UrlsContext = createContext<gaesupWorldContextType['urls']>(null);
export const StatesContext = createContext<gaesupWorldContextType['states']>(null);
export const MinimapContext = createContext<gaesupWorldContextType['minimap']>(null);
export const ControlContext = createContext<gaesupWorldContextType['control']>(null);
export const AnimationStateContext = createContext<gaesupWorldContextType['animationState']>(null);
export const CameraOptionContext = createContext<gaesupWorldContextType['cameraOption']>(null);
export const ClickerContext = createContext<gaesupWorldContextType['clicker']>(null);
export const RideableContext = createContext<gaesupWorldContextType['rideable']>(null);
export const SizesContext = createContext<gaesupWorldContextType['sizes']>(null);
export const BlockContext = createContext<gaesupWorldContextType['block']>(null);

// For backward compatibility
export const GaesupWorldContext = createContext<Partial<gaesupWorldContextType>>(null);

// Dispatch context for state updates
export const GaesupWorldDispatchContext =
  createContext<dispatchType<Partial<gaesupWorldContextType>>>(null);

// Default values
export const gaesupWorldDefault: gaesupWorldContextType = {
  activeState: {
    position: V3(0, 5, 5),
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
    isPush: {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
    },
  },
  minimap: {
    props: {},
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
  cameraOption: {
    offset: V3(-10, -10, -10),
    maxDistance: -7,
    distance: -1,
    XDistance: 20,
    YDistance: 10,
    ZDistance: 20,
    zoom: 1,
    target: vec3(),
    position: vec3(),
    focus: false,
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
