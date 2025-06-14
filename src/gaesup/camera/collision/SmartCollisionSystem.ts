import * as THREE from 'three';
import { CameraCollisionConfig } from '../../types';

export class SmartCollisionSystem {
  private raycaster = new THREE.Raycaster();
  private config: CameraCollisionConfig = {
    rayCount: 5,
    sphereCastRadius: 0.5,
    minDistance: 1,
    maxDistance: 10,
    avoidanceSmoothing: 0.3,
    transparentLayers: [],
  };

  private rayDirections: THREE.Vector3[] = [];
  private debugLines: THREE.Line[] = [];
  private debugMode = false;

  private tempVector1 = new THREE.Vector3();
  private tempVector2 = new THREE.Vector3();
  private tempVector3 = new THREE.Vector3();
  private tempQuaternion = new THREE.Quaternion();
  private tempDirection = new THREE.Vector3(0, 0, -1);

  constructor(config?: Partial<CameraCollisionConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeRayDirections();
  }

  private initializeRayDirections(): void {
    const dirs = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0.3, 0.3, 0),
      new THREE.Vector3(-0.3, 0.3, 0),
      new THREE.Vector3(0.3, -0.3, 0),
      new THREE.Vector3(-0.3, -0.3, 0),
    ];

    this.rayDirections = dirs.map((d) => d.normalize());
  }

  checkCollision(
    from: THREE.Vector3,
    to: THREE.Vector3,
    scene: THREE.Scene,
    excludeObjects?: THREE.Object3D[],
  ): THREE.Vector3 {
    this.tempVector1.subVectors(to, from).normalize();
    const distance = from.distanceTo(to);
    const bestPosition = this.findBestCameraPosition(
      from,
      to,
      this.tempVector1,
      distance,
      scene,
      excludeObjects,
    );

    return bestPosition;
  }

  private findBestCameraPosition(
    from: THREE.Vector3,
    to: THREE.Vector3,
    direction: THREE.Vector3,
    distance: number,
    scene: THREE.Scene,
    excludeObjects?: THREE.Object3D[],
  ): THREE.Vector3 {
    let bestPosition = to.clone();
    let shortestDistance = distance;

    this.tempQuaternion.setFromUnitVectors(this.tempDirection, direction);

    for (const rayDir of this.rayDirections) {
      this.tempVector2.copy(rayDir).applyQuaternion(this.tempQuaternion);

      this.tempVector3
        .copy(from)
        .add(this.tempVector2.multiplyScalar(this.config.sphereCastRadius));

      this.raycaster.set(this.tempVector3, direction);
      this.raycaster.far = distance;

      const intersects = this.raycaster.intersectObjects(scene.children, true).filter((hit) => {
        if (excludeObjects?.includes(hit.object)) return false;
        if (this.config.transparentLayers?.includes(hit.object.layers.mask)) {
          return false;
        }
        if (hit.object.userData?.intangible) return false;
        return true;
      });
      if (intersects.length > 0) {
        const hitDistance = intersects[0].distance;
        if (hitDistance < shortestDistance) {
          shortestDistance = Math.max(
            hitDistance - this.config.minDistance,
            this.config.minDistance,
          );
          bestPosition = from.clone().add(direction.clone().multiplyScalar(shortestDistance));
        }
      }
    }
    if (shortestDistance < distance * 0.5) {
      const slidePosition = this.calculateWallSlide(from, bestPosition, scene);
      if (slidePosition) {
        bestPosition = slidePosition;
      }
    }

    return bestPosition;
  }

  private calculateWallSlide(
    from: THREE.Vector3,
    collisionPoint: THREE.Vector3,
    scene: THREE.Scene,
  ): THREE.Vector3 | null {
    this.tempVector1.subVectors(collisionPoint, from).normalize();
    this.raycaster.set(from, this.tempVector1);

    const hit = this.raycaster.intersectObjects(scene.children, true)[0];
    if (!hit || !hit.face) return null;

    const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();

    this.tempVector2.crossVectors(normal, new THREE.Vector3(0, 1, 0)).normalize();

    const slideDistance = 2;
    const leftSlide = collisionPoint
      .clone()
      .add(this.tempVector2.clone().multiplyScalar(slideDistance));
    const rightSlide = collisionPoint
      .clone()
      .add(this.tempVector2.clone().multiplyScalar(-slideDistance));

    const leftClear = this.isPositionClear(leftSlide, scene);
    const rightClear = this.isPositionClear(rightSlide, scene);

    if (leftClear && !rightClear) return leftSlide;
    if (!leftClear && rightClear) return rightSlide;
    if (leftClear && rightClear) {
      return from.distanceTo(leftSlide) < from.distanceTo(rightSlide) ? leftSlide : rightSlide;
    }

    return null;
  }

  private isPositionClear(position: THREE.Vector3, scene: THREE.Scene): boolean {
    const checkRadius = this.config.sphereCastRadius * 2;

    for (const child of scene.children) {
      if (child instanceof THREE.Mesh && child.geometry.boundingSphere) {
        const distance = position.distanceTo(child.position);
        if (distance < checkRadius + child.geometry.boundingSphere.radius) {
          return false;
        }
      }
      if (child.children.length > 0) {
        for (const subChild of child.children) {
          if (subChild instanceof THREE.Mesh && subChild.geometry.boundingSphere) {
            const distance = position.distanceTo(subChild.position);
            if (distance < checkRadius + subChild.geometry.boundingSphere.radius) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  setDebugMode(enabled: boolean, scene?: THREE.Scene): void {
    this.debugMode = enabled;

    if (!enabled && scene) {
      this.debugLines.forEach((line) => scene.remove(line));
      this.debugLines = [];
    }
  }

  updateDebugVisualization(from: THREE.Vector3, to: THREE.Vector3, scene: THREE.Scene): void {
    if (!this.debugMode) return;

    this.debugLines.forEach((line) => scene.remove(line));
    this.debugLines = [];

    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geometry, material);

    scene.add(line);
    this.debugLines.push(line);
  }
}
