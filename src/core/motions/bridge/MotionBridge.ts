import { MotionEngine, MotionState, MotionMetrics, MotionType } from '../core/MotionEngine';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export interface MotionCommand {
  type: 'move' | 'jump' | 'stop' | 'turn' | 'setConfig' | 'reset';
  data?: {
    movement?: THREE.Vector3;
    direction?: number;
    force?: THREE.Vector3;
    config?: any;
  };
}

export interface MotionSnapshot {
  type: MotionType;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isMoving: boolean;
  speed: number;
  metrics: {
    currentSpeed: number;
    averageSpeed: number;
    totalDistance: number;
    frameTime: number;
    isAccelerating: boolean;
  };
  config: {
    maxSpeed: number;
    acceleration: number;
    jumpForce: number;
  };
}

export class MotionBridge {
  private engines: Map<string, MotionEngine>;
  private eventListeners: Set<(snapshot: MotionSnapshot) => void>;
  private rigidBodies: Map<string, RapierRigidBody>;
  private tempPosition: THREE.Vector3;
  private tempVelocity: THREE.Vector3;
  private tempQuaternion: THREE.Quaternion;
  private tempEuler: THREE.Euler;

  constructor() {
    this.engines = new Map();
    this.eventListeners = new Set();
    this.rigidBodies = new Map();
    this.tempPosition = new THREE.Vector3();
    this.tempVelocity = new THREE.Vector3();
    this.tempQuaternion = new THREE.Quaternion();
    this.tempEuler = new THREE.Euler();
  }

  registerEntity(id: string, type: MotionType, rigidBody: RapierRigidBody): void {
    const engine = new MotionEngine(type);
    this.engines.set(id, engine);
    this.rigidBodies.set(id, rigidBody);
  }

  unregisterEntity(id: string): void {
    const engine = this.engines.get(id);
    if (engine) {
      engine.dispose();
      this.engines.delete(id);
    }
    this.rigidBodies.delete(id);
  }

  execute(entityId: string, command: MotionCommand): void {
    const engine = this.engines.get(entityId);
    const rigidBody = this.rigidBodies.get(entityId);
    
    if (!engine || !rigidBody) return;

    switch (command.type) {
      case 'move':
        if (command.data?.movement) {
          engine.applyForce(command.data.movement, rigidBody);
        }
        break;
      case 'jump':
        const jumpForce = engine.calculateJump();
        if (jumpForce.length() > 0) {
          engine.applyForce(jumpForce, rigidBody);
        }
        break;
      case 'stop':
        const currentVel = rigidBody.linvel();
        rigidBody.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true);
        break;
      case 'setConfig':
        if (command.data?.config) {
          engine.updateConfig(command.data.config);
        }
        break;
      case 'reset':
        engine.reset();
        rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        break;
    }

    this.notifyListeners(entityId);
  }

  updateEntity(entityId: string, deltaTime: number): void {
    const engine = this.engines.get(entityId);
    const rigidBody = this.rigidBodies.get(entityId);
    
    if (!engine || !rigidBody) return;

    const translation = rigidBody.translation();
    this.tempPosition.set(translation.x, translation.y, translation.z);
    
    const linvel = rigidBody.linvel();
    this.tempVelocity.set(linvel.x, linvel.y, linvel.z);
    
    const rotation = rigidBody.rotation();
    this.tempQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    this.tempEuler.setFromQuaternion(this.tempQuaternion);

    engine.updatePosition(this.tempPosition);
    engine.updateVelocity(this.tempVelocity);
    engine.updateRotation(this.tempEuler);
    engine.update(deltaTime);
  }

  snapshot(entityId: string): MotionSnapshot | null {
    const engine = this.engines.get(entityId);
    if (!engine) return null;

    const state = engine.getState();
    const metrics = engine.getMetrics();
    const config = engine.getConfig();

    return {
      type: 'character',
      position: state.position.clone(),
      velocity: state.velocity.clone(),
      rotation: state.rotation.clone(),
      isGrounded: state.isGrounded,
      isMoving: state.isMoving,
      speed: state.speed,
      metrics: {
        currentSpeed: metrics.currentSpeed,
        averageSpeed: metrics.averageSpeed,
        totalDistance: metrics.totalDistance,
        frameTime: metrics.frameTime,
        isAccelerating: metrics.isAccelerating
      },
      config: {
        maxSpeed: config.maxSpeed,
        acceleration: config.acceleration,
        jumpForce: config.jumpForce
      }
    };
  }

  getAllSnapshots(): Map<string, MotionSnapshot> {
    const snapshots = new Map<string, MotionSnapshot>();
    
    this.engines.forEach((_, entityId) => {
      const snapshot = this.snapshot(entityId);
      if (snapshot) {
        snapshots.set(entityId, snapshot);
      }
    });

    return snapshots;
  }

  subscribe(listener: (snapshot: MotionSnapshot) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private notifyListeners(entityId: string): void {
    const snapshot = this.snapshot(entityId);
    if (snapshot) {
      this.eventListeners.forEach(listener => listener(snapshot));
    }
  }

  getActiveEntities(): string[] {
    return Array.from(this.engines.keys());
  }

  dispose(): void {
    this.engines.forEach(engine => engine.dispose());
    this.engines.clear();
    this.rigidBodies.clear();
    this.eventListeners.clear();
  }
}
