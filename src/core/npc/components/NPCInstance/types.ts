import { NPCInstance as NPCInstanceType, NPCPart } from '../../types';
export type NPCInstanceProps = {
    instance: NPCInstanceType;
    isEditMode?: boolean;
    onClick?: () => void;
};
export type NPCPartMeshProps = {
    part: NPCPart;
    instanceId: string;
    currentAnimation?: string | undefined;
};
