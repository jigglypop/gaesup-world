import type { RapierRigidBody } from '@react-three/rapier';
import { Object3D, Quaternion, Vector3 } from 'three';

type Pose = { body: RapierRigidBody; visual: Object3D; previous: Vector3; current: Vector3; previousRotation: Quaternion; rotation: Quaternion; ready: boolean };

/** Interpolates child visuals only. Rapier bodies and collision transforms remain authoritative. */
export class PhysicsPresentation {
  private poses = new Set<Pose>();
  private parentRotation = new Quaternion();
  private parentPosition = new Vector3();
  private parentScale = new Vector3();

  register(body: RapierRigidBody, visual: Object3D): () => void {
    const pose: Pose = { body, visual, previous: new Vector3(), current: new Vector3(), previousRotation: new Quaternion(), rotation: new Quaternion(), ready: false };
    this.poses.add(pose);
    return () => { this.poses.delete(pose); visual.position.set(0, 0, 0); visual.quaternion.identity(); };
  }

  beforeStep(): void {
    for (const pose of this.poses) {
      if (!pose.body.isValid()) continue;
      pose.previous.copy(pose.body.translation());
      pose.previousRotation.copy(pose.body.rotation());
    }
  }

  afterStep(): void {
    for (const pose of this.poses) {
      if (!pose.body.isValid()) continue;
      pose.current.copy(pose.body.translation());
      pose.rotation.copy(pose.body.rotation());
      pose.ready = true;
    }
  }

  present(alpha: number): void {
    for (const pose of this.poses) {
      const parent = pose.visual.parent;
      if (!pose.ready || !parent || !pose.body.isValid()) continue;
      // One ancestor walk; worldToLocal and the decompose below reuse the updated matrixWorld.
      parent.updateWorldMatrix(true, false);
      pose.visual.position.copy(pose.previous).lerp(pose.current, alpha);
      parent.worldToLocal(pose.visual.position);
      parent.matrixWorld.decompose(this.parentPosition, this.parentRotation, this.parentScale);
      this.parentRotation.invert();
      pose.visual.quaternion.copy(pose.previousRotation).slerp(pose.rotation, alpha).premultiply(this.parentRotation);
    }
  }
}
