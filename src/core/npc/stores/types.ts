import { NPCSystemState, NPCTemplate, NPCInstance, NPCCategory, NPCAnimation, NPCPart } from "../types";

export interface NPCStore extends NPCSystemState {
    initialized: boolean;
    initializeDefaults: () => void;
    addTemplate: (template: NPCTemplate) => void;
    updateTemplate: (id: string, updates: Partial<NPCTemplate>) => void;
    removeTemplate: (id: string) => void;
    addInstance: (instance: NPCInstance) => void;
    updateInstance: (id: string, updates: Partial<NPCInstance>) => void;
    removeInstance: (id: string) => void;
    addCategory: (category: NPCCategory) => void;
    updateCategory: (id: string, updates: Partial<NPCCategory>) => void;
    removeCategory: (id: string) => void;
    addAnimation: (animation: NPCAnimation) => void;
    updateAnimation: (id: string, updates: Partial<NPCAnimation>) => void;
    removeAnimation: (id: string) => void;
    setSelectedTemplate: (id: string) => void;
    setSelectedCategory: (id: string) => void;
    setSelectedInstance: (id: string) => void;
    setEditMode: (editMode: boolean) => void;
    createInstanceFromTemplate: (templateId: string, position: [number, number, number]) => void;
    updateInstancePart: (instanceId: string, partId: string, updates: Partial<NPCPart>) => void;
}
