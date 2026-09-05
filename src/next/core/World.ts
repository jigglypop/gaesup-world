import type { EntityId, NextWorldOptions } from '../types';
import { TransformStore } from './TransformStore';

const DEFAULT_CAPACITY = 1024;
const ENTITY_INDEX_BITS = 20;
const ENTITY_INDEX_MASK = (1 << ENTITY_INDEX_BITS) - 1;
const ENTITY_GENERATION_MASK = (1 << 11) - 1;

export const MAX_ENTITY_CAPACITY = 1 << ENTITY_INDEX_BITS;

export function makeEntityId(index: number, generation: number): EntityId {
  return ((generation & ENTITY_GENERATION_MASK) << ENTITY_INDEX_BITS) | (index & ENTITY_INDEX_MASK);
}

export function entityIndexOf(id: EntityId): number {
  return id & ENTITY_INDEX_MASK;
}

export function entityGenerationOf(id: EntityId): number {
  return (id >>> ENTITY_INDEX_BITS) & ENTITY_GENERATION_MASK;
}

export class NextWorld {
  readonly transforms: TransformStore;
  private capacity: number;
  private aliveFlags: Uint8Array;
  private generations: Uint16Array;
  private freeIndices: number[] = [];
  private nextIndex = 0;
  private aliveCount = 0;

  constructor(options: NextWorldOptions = {}) {
    this.capacity = Math.min(options.capacity ?? DEFAULT_CAPACITY, MAX_ENTITY_CAPACITY);
    this.aliveFlags = new Uint8Array(this.capacity);
    this.generations = new Uint16Array(this.capacity);
    this.transforms = new TransformStore(this.capacity);
  }

  get entityCount(): number {
    return this.aliveCount;
  }

  get entityCapacity(): number {
    return this.capacity;
  }

  createEntity(): EntityId {
    const reused = this.freeIndices.pop();
    const index = reused ?? this.nextIndex;
    if (reused === undefined) {
      if (this.nextIndex >= MAX_ENTITY_CAPACITY) {
        throw new Error('[NextWorld Error]: entity capacity exceeded');
      }
      this.nextIndex += 1;
      if (index >= this.capacity) {
        this.grow();
      }
    }
    this.aliveFlags[index] = 1;
    this.aliveCount += 1;
    this.transforms.resetIndex(index);
    return makeEntityId(index, this.generations[index] ?? 0);
  }

  destroyEntity(id: EntityId): boolean {
    if (!this.isAlive(id)) {
      return false;
    }
    const index = entityIndexOf(id);
    this.aliveFlags[index] = 0;
    this.generations[index] = ((this.generations[index] ?? 0) + 1) & ENTITY_GENERATION_MASK;
    this.freeIndices.push(index);
    this.aliveCount -= 1;
    return true;
  }

  isAlive(id: EntityId): boolean {
    const index = entityIndexOf(id);
    if (index >= this.capacity) {
      return false;
    }
    return this.aliveFlags[index] === 1 && (this.generations[index] ?? 0) === entityGenerationOf(id);
  }

  private grow(): void {
    const capacity = Math.min(this.capacity * 2, MAX_ENTITY_CAPACITY);
    const aliveFlags = new Uint8Array(capacity);
    aliveFlags.set(this.aliveFlags);
    const generations = new Uint16Array(capacity);
    generations.set(this.generations);
    this.aliveFlags = aliveFlags;
    this.generations = generations;
    this.transforms.grow(capacity);
    this.capacity = capacity;
  }
}
