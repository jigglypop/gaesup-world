export interface WorldObject {
  id: string;
  type: string;
  position: Vector3Tuple;
  rotation?: QuaternionTuple;
} 