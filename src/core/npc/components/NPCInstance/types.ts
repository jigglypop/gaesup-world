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
}
