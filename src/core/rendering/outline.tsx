import React, { ReactNode } from 'react';

import {
  EffectComposer,
  Outline,
  Select,
  Selection,
} from '@react-three/postprocessing';
import * as THREE from 'three';

export type ToonOutlinesProps = {
  children: ReactNode;
  /** Edge intensity (postprocessing default: 100). */
  edgeStrength?: number;
  /** Visible edge color (front-facing surfaces). */
  visibleEdgeColor?: THREE.ColorRepresentation;
  /** Hidden edge color (occluded surfaces). */
  hiddenEdgeColor?: THREE.ColorRepresentation;
  /** Pulse speed (0 = static). */
  pulseSpeed?: number;
  /** When true, edges are visible through occluding geometry. */
  xRay?: boolean;
  /** When true, blurs the outline mask for soft edges. */
  blur?: boolean;
  /** Disable MSAA on the composer (default: 0 = off, recommended for outline). */
  multisampling?: number;
  /**
   * Additional effects appended to the same EffectComposer (e.g. Bloom).
   * Pass these instead of mounting a second EffectComposer to avoid composite conflicts.
   */
  extraEffects?: ReactNode;
};

function toHex(c: THREE.ColorRepresentation): number {
  return new THREE.Color(c).getHex();
}

/**
 * Selection-based outline pipeline. Wrap the scene root with this and
 * use `<Outlined>` to mark which meshes receive outlines.
 *
 * Usage:
 *   <ToonOutlines>
 *     <Outlined><SakuraBatch trees={trees} /></Outlined>
 *     <ground />
 *   </ToonOutlines>
 */
export function ToonOutlines({
  children,
  edgeStrength = 6,
  visibleEdgeColor = '#000000',
  hiddenEdgeColor = '#000000',
  pulseSpeed = 0,
  xRay = false,
  blur = false,
  multisampling = 0,
  extraEffects,
}: ToonOutlinesProps) {
  return (
    <Selection>
      {children}
      <EffectComposer autoClear={false} multisampling={multisampling}>
        <Outline
          edgeStrength={edgeStrength}
          visibleEdgeColor={toHex(visibleEdgeColor)}
          hiddenEdgeColor={toHex(hiddenEdgeColor)}
          pulseSpeed={pulseSpeed}
          xRay={xRay}
          blur={blur}
        />
        {extraEffects as React.ReactElement}
      </EffectComposer>
    </Selection>
  );
}

export type OutlinedProps = {
  children: ReactNode;
  enabled?: boolean;
};

/**
 * Marks descendant meshes for outline rendering. Must be inside <ToonOutlines>.
 */
export function Outlined({ children, enabled = true }: OutlinedProps) {
  if (!enabled) return <>{children}</>;
  return <Select enabled>{children}</Select>;
}
