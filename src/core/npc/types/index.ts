export interface NPCPart {
  id: string;
  type: 'body' | 'hair' | 'top' | 'bottom' | 'shoes' | 'glasses' | 'hat' | 'accessory' | 'weapon';
  category?: 'basic' | 'casual' | 'formal' | 'fantasy' | 'military';
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  metadata?: {
    material?: string;
    texture?: string;
  };
}

export interface NPCTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'humanoid' | 'creature' | 'robot';
  baseParts: NPCPart[]; // 기본 파트 (body, hair 등)
  clothingParts: NPCPart[]; // 의상 파트 (top, bottom, shoes 등)
  accessoryParts?: NPCPart[]; // 액세서리 파트 (glasses, hat 등)
  defaultAnimation?: string;
  defaultClothingSet?: string; // 기본 의상 세트 ID
}

export interface ClothingSet {
  id: string;
  name: string;
  category: 'casual' | 'formal' | 'uniform' | 'fantasy' | 'sports';
  parts: NPCPart[];
  thumbnail?: string;
}

export interface NPCInstance {
  id: string;
  templateId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  currentAnimation?: string;
  currentClothingSetId?: string;
  customParts?: NPCPart[];
  metadata?: Record<string, any>;
  events?: NPCEvent[];
}

export interface NPCEvent {
  id: string;
  type: 'onClick' | 'onHover' | 'onInteract' | 'onProximity';
  action: 'dialogue' | 'animation' | 'sound' | 'custom';
  payload?: any;
}

export interface NPCCategory {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
}

export interface ClothingCategory {
  id: string;
  name: string;
  description?: string;
  clothingSetIds: string[];
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
  clothingSets: Map<string, ClothingSet>;
  clothingCategories: Map<string, ClothingCategory>;
  animations: Map<string, NPCAnimation>;
  selectedTemplateId?: string;
  selectedCategoryId?: string;
  selectedClothingSetId?: string;
  selectedClothingCategoryId?: string;
  selectedInstanceId?: string;
  editMode: boolean;
} 