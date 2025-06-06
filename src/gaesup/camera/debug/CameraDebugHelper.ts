import * as THREE from 'three';

export class CameraDebugHelper {
  private positionHistory: THREE.Vector3[] = [];
  private rotationHistory: THREE.Quaternion[] = [];
  private maxHistorySize = 10;
  private jitterThreshold = 0.1;

  recordFrame(camera: THREE.Camera): void {
    this.positionHistory.push(camera.position.clone());
    this.rotationHistory.push(camera.quaternion.clone());

    if (this.positionHistory.length > this.maxHistorySize) {
      this.positionHistory.shift();
      this.rotationHistory.shift();
    }
  }

  detectJitter(): { position: boolean; rotation: boolean; severity: number } {
    if (this.positionHistory.length < 3) {
      return { position: false, rotation: false, severity: 0 };
    }

    const positionJitter = this.calculatePositionVariance();
    const rotationJitter = this.calculateRotationVariance();

    return {
      position: positionJitter > this.jitterThreshold,
      rotation: rotationJitter > this.jitterThreshold,
      severity: Math.max(positionJitter, rotationJitter),
    };
  }

  private calculatePositionVariance(): number {
    if (this.positionHistory.length < 2) return 0;

    let totalVariance = 0;
    for (let i = 1; i < this.positionHistory.length; i++) {
      const distance = this.positionHistory[i].distanceTo(this.positionHistory[i - 1]);
      totalVariance += distance;
    }

    return totalVariance / (this.positionHistory.length - 1);
  }

  private calculateRotationVariance(): number {
    if (this.rotationHistory.length < 2) return 0;

    let totalAngle = 0;
    for (let i = 1; i < this.rotationHistory.length; i++) {
      const angle = this.rotationHistory[i].angleTo(this.rotationHistory[i - 1]);
      totalAngle += angle;
    }

    return totalAngle / (this.rotationHistory.length - 1);
  }

  getSuggestions(): string[] {
    const jitter = this.detectJitter();
    const suggestions: string[] = [];

    if (jitter.position) {
      suggestions.push('위치 지터 감지됨 - frameRateIndependentLerp 사용 권장');
    }

    if (jitter.rotation) {
      suggestions.push('회전 지터 감지됨 - smoothLookAt 사용 권장');
    }

    if (jitter.severity > 0.5) {
      suggestions.push('심각한 지터 - 블렌드 매니저와 컨트롤러 충돌 확인 필요');
    }

    return suggestions;
  }

  getDebugInfo(): object {
    const jitter = this.detectJitter();
    return {
      frameCount: this.positionHistory.length,
      jitterDetected: jitter.position || jitter.rotation,
      severity: jitter.severity,
      positionVariance: this.calculatePositionVariance(),
      rotationVariance: this.calculateRotationVariance(),
      suggestions: this.getSuggestions(),
    };
  }

  reset(): void {
    this.positionHistory = [];
    this.rotationHistory = [];
  }
}
