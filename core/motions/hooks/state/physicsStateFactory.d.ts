import * as THREE from 'three';
import { StoreState } from '@core/stores/types';
import { EntityStateManager } from '../../core/system/EntityStateManager';
import { PhysicsInputState, PhysicsState } from '../../types';
declare function createInitialPhysicsState(worldContext: StoreState, stateManager: EntityStateManager, input: PhysicsInputState, delta: number, mouseTarget: THREE.Vector3): PhysicsState;
export { createInitialPhysicsState };
