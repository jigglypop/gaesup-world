import { createContext, useContext, useLayoutEffect, type RefObject } from 'react';

import type { Object3D } from 'three';

/** A mounted NPC's drawn root, which may attach after its model loads; `height` sizes the sphere it is culled by. */
export type NPCView = { root: RefObject<Object3D | null>; height: number; seen: number };

/** Drawn roots of the mounted NPCs by id, which the NPC system hides while they are out of view. */
export const NPCViewsContext = createContext<Map<string, NPCView> | null>(null);

/** Hands `root` to the enclosing NPC system, which culls it by the NPC's pose; outside one it is always drawn. */
export function useNPCView(id: string, root: RefObject<Object3D | null>, height: number): void {
  const views = useContext(NPCViewsContext);
  useLayoutEffect(() => {
    if (!views) return undefined;
    const view: NPCView = { root, height, seen: -1 };
    views.set(id, view);
    return () => {
      if (views.get(id) === view) views.delete(id);
      if (root.current) root.current.visible = true;
    };
  }, [views, id, root, height]);
}
