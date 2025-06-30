export interface NPCPart {
  id: string;
  type: 'head' | 'body' | 'legs' | 'accessory' | 'weapon';
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
}

export interface NPCTemplate {
  id: string;
  name: string;
  description?: string;
  parts: NPCPart[];
  defaultAnimation?: string;
}

export interface NPCInstance {
  id: string;
  templateId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  currentAnimation?: string;
  customParts?: NPCPart[];
  metadata?: Record<string, any>;
}

export interface NPCCategory {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
}

export interface NPCAnimation {
  id: string;
  name: string;
  url?: string;
  loop?: boolean;
  speed?: number;
}

export interface NPCSystemState {
  templates: Map<string, NPCTemplate>;
  instances: Map<string, NPCInstance>;
  categories: Map<string, NPCCategory>;
  animations: Map<string, NPCAnimation>;
  selectedTemplateId?: string;
  selectedCategoryId?: string;
  selectedInstanceId?: string;
  editMode: boolean;
} 