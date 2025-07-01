import { NPCInstance as NPCInstanceType, NPCPart } from '../../types';
export interface NPCInstanceProps {
    instance: NPCInstanceType;
    isEditMode?: boolean;
    onClick?: () => void;
}
export interface NPCPartMeshProps {
    part: NPCPart;
    instanceId: string;
}
