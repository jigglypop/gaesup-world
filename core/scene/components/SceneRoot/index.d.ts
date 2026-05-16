import { type ReactNode } from 'react';
import type { SceneDescriptor } from '../../types';
export type SceneRootProps = {
    scene: SceneDescriptor;
    children: ReactNode;
};
/**
 * Mounts/unmounts its children based on whether the named scene is currently
 * active. Use to keep interior props out of the scene graph (and out of
 * physics) while the player is outside, and vice versa.
 *
 * The descriptor is auto-registered while this component is mounted so the
 * store always knows about the scene's spawn point.
 */
export declare function SceneRoot({ scene, children }: SceneRootProps): import("react").JSX.Element | null;
