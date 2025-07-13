import * as THREE from 'three';
import { BaseSystem, SystemContext } from '@core/boilerplate/entity/BaseSystem';
import { RegisterSystem, ManageRuntime, Profile, HandleError } from '@core/boilerplate/decorators';
import { SpatialGrid } from './SpatialGrid';

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



@RegisterSystem('world')
@ManageRuntime({ autoStart: true })
export class WorldSystem implements BaseSystem {
  private objects: Map<string, WorldObject> = new Map();
  private interactionEvents: InteractionEvent[] = [];
  private spatial: SpatialGrid = new SpatialGrid({ cellSize: 10 });
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
    this.spatial.add(object.id, object.position);
  }

  removeObject(id: string): boolean {
    const object = this.objects.get(id);
    if (object) {
      this.spatial.remove(id);
    }
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
    if (updates.position) {
      this.spatial.update(id, updates.position);
    }
    return true;
  }

  getObjectsInRadius(center: THREE.Vector3, radius: number): WorldObject[] {
    const nearbyIds = this.spatial.getNearby(center, radius);
    return nearbyIds.map((id: string) => this.objects.get(id)).filter((obj): obj is WorldObject => obj !== undefined);
  }

  checkCollisions(objectId: string): WorldObject[] {
    const object = this.objects.get(objectId);
    if (!object || !object.boundingBox) return [];

    const nearbyIds = this.spatial.getNearby(object.position, object.boundingBox.max.distanceTo(object.boundingBox.min));
    return nearbyIds
      .map((id: string) => this.objects.get(id))
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
    
    const nearbyIds = this.spatial.getNearby(origin, maxDistance);
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
