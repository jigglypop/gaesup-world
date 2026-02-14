import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';


export interface PlayerUpdateData {
  name: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  animation: string;
  velocity: [number, number, number];
  modelUrl?: string;
}

export interface PlayerTrackingConfig {
  updateRate: number;
  velocityThreshold: number;
  sendRateLimit: number;
}

export class PlayerPositionTracker {
  private lastPosition = new THREE.Vector3();
  private lastRotation = new THREE.Quaternion();
  private lastAnimation = 'idle';
  private velocity = new THREE.Vector3();
  private lastUpdateTime = 0;
  private config: PlayerTrackingConfig;
  private tempPos = new THREE.Vector3();
  private tempRot = new THREE.Quaternion();
  private tempSendRot = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();
  private baseYaw: number | null = null;

  constructor(config: PlayerTrackingConfig) {
    this.config = config;
  }

  trackPosition(
    playerRef: { current: RapierRigidBody | null },
    playerName: string,
    playerColor: string,
    modelUrl?: string,
    animationName?: string | null,
  ): PlayerUpdateData | null {
    if (!playerRef.current) return null;

    const now = Date.now();
    if (now - this.lastUpdateTime < this.config.sendRateLimit) {
      return null;
    }

    const currentPos = playerRef.current.translation();
    const currentRot = playerRef.current.rotation();
    this.tempPos.set(currentPos.x, currentPos.y, currentPos.z);
    this.tempRot.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w);

    // 속도 계산: Rapier의 linvel을 우선 사용 (더 안정적/저렴)
    const body = playerRef.current as unknown as { linvel?: () => { x: number; y: number; z: number } };
    const lv = typeof body.linvel === 'function' ? body.linvel() : null;
    if (lv) {
      this.velocity.set(lv.x, lv.y, lv.z);
    } else {
      const deltaTime = (now - this.lastUpdateTime) / 1000;
      if (deltaTime > 0) {
        this.velocity.set(
          (currentPos.x - this.lastPosition.x) / deltaTime,
          (currentPos.y - this.lastPosition.y) / deltaTime,
          (currentPos.z - this.lastPosition.z) / deltaTime
        );
      }
    }

    // 현재 애니메이션 상태 결정
    const speed = this.velocity.length();
    const requested = typeof animationName === 'string' ? animationName.trim() : '';
    const runThreshold = this.config.velocityThreshold;
    const idleThreshold = this.config.velocityThreshold * 0.6;
    const fallback =
      this.lastAnimation === 'run'
        ? (speed < idleThreshold ? 'idle' : 'run')
        : (speed > runThreshold ? 'run' : 'idle');
    const currentAnimation = requested.length > 0 ? requested : fallback;

    // 캐릭터는 물리에서 rigidbody 회전이 고정되는 경우가 많아서,
    // 이동 방향(velocity) 기반으로 yaw를 만들어 전송해야 원격에서도 방향전환이 된다.
    this.tempSendRot.copy(this.tempRot);
    const vx = this.velocity.x;
    const vz = this.velocity.z;
    const horizontalSpeed = Math.hypot(vx, vz);
    if (horizontalSpeed > 0.05) {
      if (this.baseYaw === null) {
        // 첫 프레임의 "모델 기본 정면" 보정 (예: 초기 y = PI)
        this.tempEuler.setFromQuaternion(this.tempRot, 'YXZ');
        // Many character rigs face -Z; our yaw (atan2(vx, vz)) assumes +Z forward.
        // Add PI so remote faces the same direction as local.
        this.baseYaw = this.tempEuler.y + Math.PI;
      }
      const yaw = Math.atan2(vx, vz) + (this.baseYaw ?? 0);
      this.tempEuler.set(0, yaw, 0, 'YXZ');
      this.tempSendRot.setFromEuler(this.tempEuler);
    }

    // 위치, 회전 또는 애니메이션이 변경되었을 때만 업데이트
    const hasPositionChanged = !this.lastPosition.equals(this.tempPos);
    const hasRotationChanged = !this.lastRotation.equals(this.tempSendRot);
    const hasAnimationChanged = this.lastAnimation !== currentAnimation;

    if (!hasPositionChanged && !hasRotationChanged && !hasAnimationChanged) {
      return null;
    }

    const updateData: PlayerUpdateData = {
      name: playerName,
      color: playerColor,
      position: [currentPos.x, currentPos.y, currentPos.z],
      // Quaternion (w, x, y, z)
      rotation: [this.tempSendRot.w, this.tempSendRot.x, this.tempSendRot.y, this.tempSendRot.z],
      animation: currentAnimation,
      velocity: [this.velocity.x, this.velocity.y, this.velocity.z],
      ...(modelUrl !== undefined ? { modelUrl } : {})
    };

    // 상태 업데이트
    this.lastPosition.copy(this.tempPos);
    this.lastRotation.copy(this.tempSendRot);
    this.lastAnimation = currentAnimation;
    this.lastUpdateTime = now;

    return updateData;
  }

  updateConfig(config: Partial<PlayerTrackingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  reset(): void {
    this.lastPosition.set(0, 0, 0);
    this.lastRotation.set(0, 0, 0, 1);
    this.lastAnimation = 'idle';
    this.velocity.set(0, 0, 0);
    this.lastUpdateTime = 0;
    this.baseYaw = null;
  }
} 