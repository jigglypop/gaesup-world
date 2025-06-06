import * as THREE from 'three';
import { CollisionConfig } from './types';

export class SmartCollisionSystem {
  private raycaster = new THREE.Raycaster();
  private config: CollisionConfig = {
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

  constructor(config?: Partial<CollisionConfig>) {
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
    const direction = new THREE.Vector3().subVectors(to, from).normalize();
    const distance = from.distanceTo(to);
    const bestPosition = this.findBestCameraPosition(
      from,
      to,
      direction,
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

    for (const rayDir of this.rayDirections) {
      const offsetDir = rayDir
        .clone()
        .applyQuaternion(
          new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction),
        );

      const rayOrigin = from
        .clone()
        .add(offsetDir.clone().multiplyScalar(this.config.sphereCastRadius));

      this.raycaster.set(rayOrigin, direction);
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
    const direction = new THREE.Vector3().subVectors(collisionPoint, from).normalize();
    this.raycaster.set(from, direction);

    const hit = this.raycaster.intersectObjects(scene.children, true)[0];
    if (!hit || !hit.face) return null;

    const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();

    const slideDirection = new THREE.Vector3()
      .crossVectors(normal, new THREE.Vector3(0, 1, 0))
      .normalize();

    const slideDistance = 2;
    const leftSlide = collisionPoint
      .clone()
      .add(slideDirection.clone().multiplyScalar(slideDistance));
    const rightSlide = collisionPoint
      .clone()
      .add(slideDirection.clone().multiplyScalar(-slideDistance));

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
    const nearbyObjects: THREE.Object3D[] = [];

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry.boundingSphere) {
        const distance = position.distanceTo(object.position);
        if (distance < checkRadius + object.geometry.boundingSphere.radius) {
          nearbyObjects.push(object);
        }
      }
    });

    return nearbyObjects.length === 0;
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
