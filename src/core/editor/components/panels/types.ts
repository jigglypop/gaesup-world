export type AnimationPanelTab = 'Player' | 'Controller' | 'Debug';
export type CameraPanelTab = 'Controller' | 'Presets' | 'Debug';
export type MotionPanelTab = 'Controller' | 'Debug';

export type BlueprintType = 'character' | 'vehicle' | 'airplane' | 'animation' | 'behavior' | 'item';

export type BlueprintCategory = {
  id: string;
  name: string;
  type: BlueprintType;
  icon: string;
  count: number;
};

export type BlueprintItem = {
  id: string;
  name: string;
  type: BlueprintType;
  version: string;
  tags: string[];
  description?: string;
  lastModified: string;
  thumbnail?: string;
}; 