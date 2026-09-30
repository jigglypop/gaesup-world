import { Vector3 } from 'three';

import { SpatialGrid } from '../../world/core/SpatialGrid';
import type { NPCInstance, NPCObservation } from '../types';
import { createNPCObservation } from './brain';

/** Reuses the world spatial grid, while preserving the linear observer's tie order and 3D range test. */
export class NPCPerceptionIndex {
  private grid = new SpatialGrid({ cellSize: 16 });
  private instances = new Map<string, NPCInstance>();
  private order = new Map<string, number>();
  private position = new Vector3();
  private nearby: string[] = [];

  refresh(instances: Map<string, NPCInstance>): void {
    for (const id of this.order.keys()) if (!instances.has(id)) this.grid.remove(id);
    this.order.clear(); this.instances = instances;
    let index = 0;
    for (const instance of instances.values()) {
      this.order.set(instance.id, index++);
      this.grid.update(instance.id, this.position.set(...instance.position));
    }
  }

  observe(instance: NPCInstance, timestamp: number): NPCObservation {
    const perception = instance.perception;
    if (!perception?.enabled || perception.sightRadius <= 0) return createNPCObservation(instance, this.instances, timestamp);
    const ids = this.grid.getNearby(this.position.set(...instance.position), perception.sightRadius, this.nearby);
    ids.sort((a, b) => this.order.get(a)! - this.order.get(b)!);
    return createNPCObservation(instance, this.instances, timestamp, ids.map(id => this.instances.get(id)!));
  }
}
