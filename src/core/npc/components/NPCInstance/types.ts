import type { NPCClips } from './figure';
import type { ClipTransitionOptions } from '../../../animation/hooks/useClipTransition';
import type { ImportedMaterialPolicy } from '../../../assets/materialPolicy';
import { NPCInstance as NPCInstanceType, NPCPart } from '../../types';
export interface NPCInstanceProps {
    instance: NPCInstanceType;
    isEditMode?: boolean;
    onClick?: () => void;
    /** Stable alternative to `onClick` that receives the instance id, so lists can pass one callback without breaking memo. */
    onSelect?: (instanceId: string) => void;
}
export interface NPCPartMeshProps {
    part: NPCPart;
    instanceId: string;
    currentAnimation?: string | undefined;
    /** How `currentAnimation` plays: one-shots, stance and rates, the same for every part of the NPC. */
    transition?: ClipTransitionOptions | undefined;
    /** Radius around the part's origin that must be in view for its animation to advance. */
    cullRadius?: number | undefined;
    materialPolicy?: ImportedMaterialPolicy | undefined;
    /** The body reports its prepared clips, so the NPC knows which gestures it has and how fast it strides. */
    onClips?: ((clips: NPCClips) => void) | undefined;
    /** Height the body is drawn at; it reports the scale and lift that fit it, or undefined without a height. */
    height?: number | undefined;
    onFit?: ((fit: { scale: number; y: number } | undefined) => void) | undefined;
}
