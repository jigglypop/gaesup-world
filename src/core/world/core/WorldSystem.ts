import * as THREE from 'three';
import { BaseSystem, SystemContext } from '@core/boilerplate/entity/BaseSystem';
import { ManageRuntime, Profile, HandleError } from '@core/boilerplate/decorators';

export interface WorldObject {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  type: 'active' | 'passive' | 'rideable' | 'static';
  metadata?: Record<string, unknown>;
  boundingBox?: THREE.Box3;
  isActive?: boolean;
  canInteract?: boolean;
}

export interface RideableObject extends WorldObject {
  type: 'rideable';
  maxSpeed: number;
  acceleration: number;
  isOccupied: boolean;
  occupant?: string;
  controls: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface InteractionEvent {
  type: 'collision' | 'proximity' | 'custom';
  object1Id: string;
  object2Id?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<string>> = new Map();

  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }

  addObject(id: string, position: THREE.Vector3): void {
    const key = this.getCellKey(position.x, position.z);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)!.add(id);
  }

  removeObject(id: string, position: THREE.Vector3): void {
    const key = this.getCellKey(position.x, position.z);
    const cell = this.cells.get(key);
    if (cell) {
      cell.delete(id);
      if (cell.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  getNearbyObjects(position: THREE.Vector3, radius: number = 1): string[] {
    const result: Set<string> = new Set();
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerX = Math.floor(position.x / this.cellSize);
    const centerZ = Math.floor(position.z / this.cellSize);

    for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
      for (let z = centerZ - cellRadius; z <= centerZ + cellRadius; z++) {
        const key = `${x},${z}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach(id => result.add(id));
        }
      }
    }

    return Array.from(result);
  }

  clear(): void {
    this.cells.clear();
  }
}

@ManageRuntime({ autoStart: true })
export class WorldSystem implements BaseSystem {
  private objects: Map<string, WorldObject> = new Map();
  private interactionEvents: InteractionEvent[] = [];
  private spatial: SpatialGrid = new SpatialGrid(10);
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private tempVector: THREE.Vector3 = new THREE.Vector3();

  @HandleError()
  async init(): Promise<void> {
    console.log('[WorldSystem] Initialized');
  }

  @Profile()
  @HandleError()
  update(context: SystemContext): void {
    // 월드 업데이트 로직
    // 예: checkCollisions 등 주기적인 검사가 필요할 때 여기에 로직 추가
  }

  @HandleError()
  dispose(): void {
    this.cleanup();
  }

  addObject(object: WorldObject): void {
    this.objects.set(object.id, object);
    this.spatial.addObject(object.id, object.position);
  }

  removeObject(id: string): boolean {
    this.spatial.removeObject(id, this.objects.get(id)?.position as THREE.Vector3);
    return this.objects.delete(id);
  }

  getObject(id: string): WorldObject | undefined {
    return this.objects.get(id);
  }

  getAllObjects(): WorldObject[] {
    return Array.from(this.objects.values());
  }

  getObjectsByType(type: WorldObject['type']): WorldObject[] {
    return this.getAllObjects().filter(obj => obj.type === type);
  }

  updateObject(id: string, updates: Partial<WorldObject>): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    Object.assign(object, updates);
    this.spatial.removeObject(id, object.position);
    this.spatial.addObject(id, object.position);
    return true;
  }

  getObjectsInRadius(center: THREE.Vector3, radius: number): WorldObject[] {
    const nearbyIds = this.spatial.getNearbyObjects(center, radius);
    return nearbyIds.map(id => this.objects.get(id)).filter(obj => obj !== undefined) as WorldObject[];
  }

  checkCollisions(objectId: string): WorldObject[] {
    const object = this.objects.get(objectId);
    if (!object || !object.boundingBox) return [];

    const nearbyIds = this.spatial.getNearbyObjects(object.position, object.boundingBox.max.distanceTo(object.boundingBox.min));
    return nearbyIds
      .map(id => this.objects.get(id))
      .filter((other): other is WorldObject => 
        other !== undefined &&
        other.id !== objectId && 
        other.boundingBox !== undefined &&
        object.boundingBox!.intersectsBox(other.boundingBox)
      );
  }

  processInteraction(event: InteractionEvent): void {
    this.interactionEvents.push(event);
    
    if (this.interactionEvents.length > 1000) {
      this.interactionEvents = this.interactionEvents.slice(-500);
    }
  }

  getRecentEvents(timeWindow: number = 1000): InteractionEvent[] {
    const now = Date.now();
    return this.interactionEvents.filter(event => 
      now - event.timestamp <= timeWindow
    );
  }

  raycast(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number = 100): {
    object: WorldObject;
    distance: number;
    point: THREE.Vector3;
  } | null {
    this.raycaster.set(origin, direction);
    this.raycaster.near = 0;
    this.raycaster.far = maxDistance;
    
    const nearbyIds = this.spatial.getNearbyObjects(origin, maxDistance);
    for (const id of nearbyIds) {
      const object = this.objects.get(id);
      if (object && object.boundingBox) {
        const intersect = this.raycaster.ray.intersectBox(object.boundingBox, this.tempVector);
        if (intersect) {
          return {
            object,
            distance: origin.distanceTo(intersect),
            point: intersect.clone()
          };
        }
      }
    }
    
    return null;
  }

  cleanup(): void {
    this.objects.clear();
    this.interactionEvents.length = 0;
    this.spatial.clear();
  }
}
