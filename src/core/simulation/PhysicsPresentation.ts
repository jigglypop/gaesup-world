import type { RapierRigidBody } from '@react-three/rapier';
import { Object3D, Quaternion, Vector3 } from 'three';

type Pose = {
  body: RapierRigidBody; visual: Object3D; previous: Vector3; current: Vector3; previousRotation: Quaternion; rotation: Quaternion; ready: boolean;
  /** Interpolated world position, published on the target while registered. */
  world: Vector3; target: PresentationTarget | undefined;
};

/** Receives the interpolated world position, e.g. the active character's state that cameras follow. */
export type PresentationTarget = { presentedPosition?: Vector3 };

/** Interpolates child visuals only. Rapier bodies and collision transforms remain authoritative. */
export class PhysicsPresentation {
  private poses = new Set<Pose>();
  private parentRotation = new Quaternion();
  private parentPosition = new Vector3();
  private parentScale = new Vector3();

  register(body: RapierRigidBody, visual: Object3D, target?: PresentationTarget): () => void {
    const pose: Pose = {
      body, visual, previous: new Vector3(), current: new Vector3(), previousRotation: new Quaternion(), rotation: new Quaternion(), ready: false,
      world: new Vector3(), target,
    };
    if (target && body.isValid()) pose.world.copy(body.translation());
    this.poses.add(pose);
    if (target) target.presentedPosition = pose.world;
    return () => {
      this.poses.delete(pose);
      visual.position.set(0, 0, 0); visual.quaternion.identity();
      if (target?.presentedPosition === pose.world) delete target.presentedPosition;
    };
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
      pose.world.copy(pose.previous).lerp(pose.current, alpha);
      parent.worldToLocal(pose.visual.position.copy(pose.world));
      parent.matrixWorld.decompose(this.parentPosition, this.parentRotation, this.parentScale);
      this.parentRotation.invert();
      pose.visual.quaternion.copy(pose.previousRotation).slerp(pose.rotation, alpha).premultiply(this.parentRotation);
    }
  }
}
