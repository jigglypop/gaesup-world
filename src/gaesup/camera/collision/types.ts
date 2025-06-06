export interface CollisionConfig {
  rayCount: number;
  sphereCastRadius: number;
  minDistance: number;
  maxDistance: number;
  avoidanceSmoothing: number;
  transparentLayers?: number[];
}
