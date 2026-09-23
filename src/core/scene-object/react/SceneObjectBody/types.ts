import type { ReactNode } from 'react';

import type { SceneLayerId, SceneObject, SceneObjectId } from '../../types';

export type SceneObjectPhysicsEventKind = 'triggerEnter' | 'triggerExit' | 'collisionEnter' | 'collisionExit';

export type SceneObjectBodyProps = {
  object: SceneObject;
  collisionGroups?: ReadonlyMap<SceneLayerId, number>;
  onPhysicsEvent?: (kind: SceneObjectPhysicsEventKind, objectId: SceneObjectId, otherId: string) => void;
  children?: ReactNode;
};
