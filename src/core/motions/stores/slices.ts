import { StateCreator } from 'zustand';
import { StoreState } from '../../stores/types';
import { MotionSliceState, MotionActions, MotionState, MotionConfig, MotionMetrics } from './types';
import * as THREE from 'three';

const createDefaultMotionState = (): MotionState => ({
  isActive: false,
  currentPreset: 'normal',
  motionType: 'character',
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  rotation: new THREE.Euler(),
  speed: 0,
  direction: new THREE.Vector3(),
  isGrounded: false,
  isMoving: false,
  lastUpdate: 0
});

const createDefaultMotionConfig = (): MotionConfig => ({
  maxSpeed: 10,
  acceleration: 15,
  deceleration: 10,
  turnSpeed: 8,
  jumpForce: 12,
  gravity: -30,
  linearDamping: 0.95,
  angularDamping: 0.85
});

const createDefaultMotionMetrics = (): MotionMetrics => ({
  currentSpeed: 0,
  averageSpeed: 0,
  totalDistance: 0,
  frameTime: 0,
  physicsTime: 0,
  isAccelerating: false,
  groundContact: false,
  lastPosition: new THREE.Vector3()
});

export const createMotionSlice: StateCreator<
  StoreState,
  [],
  [],
  MotionSliceState & MotionActions
> = (set, get) => ({
  motion: createDefaultMotionState(),
  config: createDefaultMotionConfig(),
  metrics: createDefaultMotionMetrics(),
  entities: new Map(),
  activeEntityId: null,

  setMotionActive: (active: boolean) =>
    set((state) => ({
      motion: { ...state.motion, isActive: active }
    })),

  setCurrentPreset: (preset: string) =>
    set((state) => ({
      motion: { ...state.motion, currentPreset: preset }
    })),

  setMotionType: (type: 'character' | 'vehicle' | 'airplane') =>
    set((state) => ({
      motion: { ...state.motion, motionType: type }
    })),

  updatePosition: (position: THREE.Vector3) =>
    set((state) => ({
      motion: { ...state.motion, position: position.clone() }
    })),

  updateVelocity: (velocity: THREE.Vector3) =>
    set((state) => {
      const speed = velocity.length();
      return {
        motion: { 
          ...state.motion, 
          velocity: velocity.clone(),
          speed,
          isMoving: speed > 0.1
        }
      };
    }),

  updateRotation: (rotation: THREE.Euler) =>
    set((state) => ({
      motion: { ...state.motion, rotation: rotation.clone() }
    })),

  setGrounded: (grounded: boolean) =>
    set((state) => ({
      motion: { ...state.motion, isGrounded: grounded }
    })),

  updateConfig: (newConfig: Partial<MotionConfig>) =>
    set((state) => ({
      config: { ...state.config, ...newConfig }
    })),

  updateMetrics: (newMetrics: Partial<MotionMetrics>) =>
    set((state) => ({
      metrics: { ...state.metrics, ...newMetrics }
    })),

  registerEntity: (id: string, entityState: MotionState) =>
    set((state) => {
      const newEntities = new Map(state.entities);
      newEntities.set(id, entityState);
      return {
        entities: newEntities,
        activeEntityId: state.activeEntityId || id
      };
    }),

  unregisterEntity: (id: string) =>
    set((state) => {
      const newEntities = new Map(state.entities);
      newEntities.delete(id);
      return {
        entities: newEntities,
        activeEntityId: state.activeEntityId === id ? null : state.activeEntityId
      };
    }),

  setActiveEntity: (id: string) =>
    set((state) => ({
      activeEntityId: state.entities.has(id) ? id : null
    })),

  resetMotion: () =>
    set(() => ({
      motion: createDefaultMotionState(),
      config: createDefaultMotionConfig(),
      metrics: createDefaultMotionMetrics(),
      entities: new Map(),
      activeEntityId: null
    }))
});
