import React, { ReactNode } from 'react';
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
export declare function ToonOutlines({ children, edgeStrength, visibleEdgeColor, hiddenEdgeColor, pulseSpeed, xRay, blur, multisampling, extraEffects, }: ToonOutlinesProps): React.JSX.Element;
export type OutlinedProps = {
    children: ReactNode;
    enabled?: boolean;
};
/**
 * Marks descendant meshes for outline rendering. Must be inside <ToonOutlines>.
 */
export declare function Outlined({ children, enabled }: OutlinedProps): React.JSX.Element;
