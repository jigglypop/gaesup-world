import { proxy, ref } from 'valtio';
import { devtools } from 'valtio/utils';
import * as THREE from 'three';
import { vec3, quat, euler } from '@react-three/rapier';
import { V3 } from '../utils/vector';

export const gameStore = proxy({
  physics: ref({
    activeState: {
      position: V3(0, 5, 5),
      velocity: vec3(),
      quat: quat(),
      euler: euler(),
      dir: vec3(),
      direction: vec3(),
    },
    refs: {
      rigidBodyRef: null as any,
      colliderRef: null as any,
      outerGroupRef: null as any,
      innerGroupRef: null as any,
    },
    cache: {
      lastPosition: V3(0, 0, 0),
      lastVelocity: vec3(),
      deltaPosition: V3(0, 0, 0),
      groundRay: {
        origin: V3(0, 0, 0),
        dir: V3(0, -1, 0),
        hit: null,
        length: 10,
      },
      cameraRay: {
        origin: V3(0, 0, 0),
        hit: null,
        length: -7,
      },
    },
  }),

  gameStates: {
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
    canRide: false,
    nearbyRideable: null,
    shouldEnterRideable: false,
    shouldExitRideable: false,
  },

  input: {
    keyboard: {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false,
    },
    pointer: {
      target: V3(0, 0, 0),
      angle: Math.PI / 2,
      isActive: false,
      shouldRun: false,
    },
    gamepad: {
      connected: false,
      leftStick: { x: 0, y: 0 },
      rightStick: { x: 0, y: 0 },
      buttons: {},
    },
    blocks: {
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
  },

  camera: ref({
    position: new THREE.Vector3(-15, 8, -15),
    target: new THREE.Vector3(),
  }),

  ui: {
    mode: {
      type: 'character',
      controller: 'clicker',
      control: 'chase',
    },
    animation: {
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
      offset: new THREE.Vector3(),
      maxDistance: -7,
      distance: -1,
      xDistance: 15,
      yDistance: 8,
      zDistance: 15,
      zoom: 1,
      focus: false,
      enableCollision: true,
      collisionMargin: 0.1,
      smoothing: {
        position: 0.08,
        rotation: 0.1,
        fov: 0.1,
      },
      fov: 75,
      minFov: 10,
      maxFov: 120,
    },
  },

  resources: {
    urls: {
      characterUrl: null,
      vehicleUrl: null,
      airplaneUrl: null,
      wheelUrl: null,
      ridingUrl: null,
    },
    sizes: {} as Record<string, THREE.Vector3>,
    rideable: {} as Record<string, any>,
  },

  config: {
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
    controllerOptions: {
      lerp: {
        cameraTurn: 1,
        cameraPosition: 1,
      },
    },
  },

  minimap: {
    props: {},
  },
});

if (import.meta.env.DEV) {
  devtools(gameStore, { name: 'Gaesup Store' });
}
