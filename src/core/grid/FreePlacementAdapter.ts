import type { FreePlacementAdapterOptions, FreePlacementCoord, GridAdapter, Vec3 } from './types';

export class FreePlacementAdapter implements GridAdapter<FreePlacementCoord> {
  readonly id: string;
  private readonly precision: number;

  constructor(options: FreePlacementAdapterOptions = {}) {
    this.id = options.id ?? 'free';
    this.precision = options.precision ?? 1000;
  }

  toWorld(coord: FreePlacementCoord): Vec3 {
    return { ...coord.position };
  }

  fromWorld(position: Vec3): FreePlacementCoord {
    return { position: { ...position } };
  }

  getNeighbors(coord: FreePlacementCoord): FreePlacementCoord[] {
    return [coord];
  }

  equals(a: FreePlacementCoord, b: FreePlacementCoord): boolean {
    return this.key(a) === this.key(b);
  }

  key(coord: FreePlacementCoord): string {
    const p = coord.position;
    return [
      this.quantize(p.x),
      this.quantize(p.y),
      this.quantize(p.z),
    ].join(':');
  }

  private quantize(value: number): number {
    return Math.round(value * this.precision) / this.precision;
  }
}

