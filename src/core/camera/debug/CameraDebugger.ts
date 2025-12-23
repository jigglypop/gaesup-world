import * as THREE from 'three';

import { Profile, HandleError, MonitorMemory } from '@/core/boilerplate/decorators';

export interface CameraDebugInfo {
  position: THREE.Vector3;
  target: THREE.Vector3;
  distance: number;
  fov: number;
  state: string;
  timestamp: number;
}

export class CameraDebugger {
  private isEnabled = false;
  private positionHistory: THREE.Vector3[] = [];
  private debugInfo: CameraDebugInfo[] = [];
  private maxHistoryLength = 100;
  private cleanupInterval: number | null = null;
  private disposables = new Set<() => void>();
  private debugLines: THREE.Line[] = [];
  private scene: THREE.Scene | null = null;

  constructor(scene?: THREE.Scene) {
    this.scene = scene || null;
  }

  @HandleError()
  enable(scene?: THREE.Scene): void {
    this.isEnabled = true;
    if (scene) this.scene = scene;
    this.setupCleanupInterval();
    this.setupEventListeners();
  }

  @HandleError()
  disable(): void {
    this.isEnabled = false;
    this.cleanup();
  }

  private setupCleanupInterval(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupOldHistory();
    }, 5000);

    this.disposables.add(() => {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
    });
  }

  private setupEventListeners(): void {
    const handleResize = () => this.handleResize();
    window.addEventListener('resize', handleResize);

    this.disposables.add(() => window.removeEventListener('resize', handleResize));
  }

  private handleResize = () => {
    this.clearDebugInfo();
    if (this.debugInfo.lastUpdate) {
      this.debugInfo.lastUpdate = Date.now();
    }
  };

  @Profile()
  update(camera: THREE.Camera, deltaTime: number, state?: string): void {
    if (!this.isEnabled) return;

    const position = camera.position.clone();
    const target = new THREE.Vector3();

    camera.getWorldDirection(target);
    target.multiplyScalar(10).add(position);

    this.addPositionToHistory(position);

    const debugInfo: CameraDebugInfo = {
      position: position.clone(),
      target: target.clone(),
      distance: position.length(),
      fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 0,
      state: state || 'unknown',
      timestamp: Date.now(),
    };

    this.addDebugInfo(debugInfo);
    this.updateDebugVisuals(camera);
  }

  private addPositionToHistory(position: THREE.Vector3): void {
    this.positionHistory.push(position.clone());

    if (this.positionHistory.length > this.maxHistoryLength) {
      this.positionHistory.shift();
    }
  }

  private addDebugInfo(info: CameraDebugInfo): void {
    this.debugInfo.push(info);

    if (this.debugInfo.length > this.maxHistoryLength) {
      this.debugInfo.shift();
    }
  }

  @Profile()
  private updateDebugVisuals(camera: THREE.Camera): void {
    if (!this.scene) return;

    this.clearDebugLines();

    if (this.positionHistory.length > 1) {
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];

      this.positionHistory.forEach((pos) => {
        positions.push(pos.x, pos.y, pos.z);
      });

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.6,
      });

      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.debugLines.push(line);

      this.disposables.add(() => {
        geometry.dispose();
        material.dispose();
        if (this.scene) {
          this.scene.remove(line);
        }
      });
    }
  }

  @HandleError()
  private clearDebugLines(): void {
    this.debugLines.forEach((line) => {
      if (line.geometry) line.geometry.dispose();
      if (line.material instanceof THREE.Material) {
        line.material.dispose();
      }
      if (this.scene) {
        this.scene.remove(line);
      }
    });
    this.debugLines.length = 0;
  }

  @Profile()
  private cleanupOldHistory(): void {
    const now = Date.now();
    const maxAge = 10000;

    this.debugInfo = this.debugInfo.filter((info) => now - info.timestamp < maxAge);

    if (this.positionHistory.length > this.maxHistoryLength * 0.8) {
      const removeCount = Math.floor(this.positionHistory.length * 0.2);
      this.positionHistory.splice(0, removeCount);
    }
  }

  @MonitorMemory(5)
  getDebugInfo(): CameraDebugInfo[] {
    return [...this.debugInfo];
  }

  @MonitorMemory(5)
  getPositionHistory(): THREE.Vector3[] {
    return [...this.positionHistory];
  }

  @MonitorMemory(10)
  exportData(): string {
    const data = {
      debugInfo: this.debugInfo,
      positionHistory: this.positionHistory.map((pos) => ({ x: pos.x, y: pos.y, z: pos.z })),
      timestamp: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }

  @HandleError()
  clearDebugInfo(): void {
    this.debugInfo.length = 0;
    this.positionHistory.length = 0;
    this.clearDebugLines();
  }

  private cleanup(): void {
    this.clearDebugInfo();
    this.clearDebugLines();
  }

  @HandleError()
  dispose(): void {
    this.disable();
    this.disposables.forEach((dispose) => dispose());
    this.disposables.clear();
    this.cleanup();
  }
} 