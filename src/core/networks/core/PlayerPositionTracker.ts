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

  constructor(config: PlayerTrackingConfig) {
    this.config = config;
  }

  trackPosition(
    playerRef: any,
    playerName: string,
    playerColor: string,
    modelUrl?: string
  ): PlayerUpdateData | null {
    if (!playerRef.current) return null;

    const now = Date.now();
    if (now - this.lastUpdateTime < this.config.sendRateLimit) {
      return null;
    }

    const currentPos = playerRef.current.translation();
    const currentRot = playerRef.current.rotation();

    // 속도 계산
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    if (deltaTime > 0) {
      this.velocity.set(
        (currentPos.x - this.lastPosition.x) / deltaTime,
        (currentPos.y - this.lastPosition.y) / deltaTime,
        (currentPos.z - this.lastPosition.z) / deltaTime
      );
    }

    // 현재 애니메이션 상태 결정
    const speed = this.velocity.length();
    const currentAnimation = speed > this.config.velocityThreshold ? 'run' : 'idle';

    // 위치, 회전 또는 애니메이션이 변경되었을 때만 업데이트
    const hasPositionChanged = !this.lastPosition.equals(currentPos);
    const hasRotationChanged = !this.lastRotation.equals(currentRot);
    const hasAnimationChanged = this.lastAnimation !== currentAnimation;

    if (!hasPositionChanged && !hasRotationChanged && !hasAnimationChanged) {
      return null;
    }

    const updateData: PlayerUpdateData = {
      name: playerName,
      color: playerColor,
      position: [currentPos.x, currentPos.y, currentPos.z],
      rotation: [currentRot.w, currentRot.x, currentRot.y, currentRot.z],
      animation: currentAnimation,
      velocity: [this.velocity.x, this.velocity.y, this.velocity.z],
      modelUrl
    };

    // 상태 업데이트
    this.lastPosition.copy(currentPos);
    this.lastRotation.copy(currentRot);
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
  }
} 