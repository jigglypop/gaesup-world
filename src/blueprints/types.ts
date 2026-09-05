export type BlueprintPrimitive = string | number | boolean | null;
export type BlueprintValue = BlueprintPrimitive | BlueprintRecord | BlueprintValue[];
export type BlueprintRecord = { [key: string]: BlueprintValue };

export type Blueprint = {
  id: string;
  name: string;
  description?: string;
  version: string;
  tags?: string[];
  metadata?: BlueprintRecord;
};

export type CameraConfig = {
  mode?: 'firstPerson' | 'thirdPerson' | 'chase' | 'topDown' | 'sideScroll' | 'fixed';
  distance?: { x: number; y: number; z: number };
  fov?: number;
  smoothing?: { position: number; rotation: number; fov: number };
  enableCollision?: boolean;
  enableZoom?: boolean;
  zoomSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
};

export type ControlConfig = {
  enableKeyboard?: boolean;
  enableMouse?: boolean;
  enableGamepad?: boolean;
  clickToMove?: boolean;
  keyMapping?: Record<string, string>;
};

export type CharacterBlueprint = Blueprint & {
  type: 'character';
  
  physics: {
    mass: number;
    height: number;
    radius: number;
    jumpForce: number;
    moveSpeed: number;
    runSpeed: number;
    airControl: number;
  };
  
  animations: {
    idle: string | string[];
    walk: string | string[];
    run: string | string[];
    jump: {
      start: string;
      loop: string;
      land: string;
    };
    combat?: Record<string, string | string[]>;
    special?: Record<string, string | string[]>;
  };
  
  behaviors?: {
    type: 'state-machine' | 'behavior-tree';
    data: BlueprintRecord;
  };
  
  stats: {
    health: number;
    stamina: number;
    mana?: number;
    strength: number;
    defense: number;
    speed: number;
  };
  
  visuals?: {
    parts?: BlueprintPart[];
    model?: string;
    textures?: string[];
    materials?: BlueprintRecord;
    scale?: number;
  };
  
  camera?: CameraConfig;
  controls?: ControlConfig;
};

export type BlueprintPart = {
  id: string;
  type: 'body' | 'hair' | 'top' | 'bottom' | 'shoes' | 'glasses' | 'hat' | 'accessory' | 'weapon';
  url: string;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export type VehicleBlueprint = Blueprint & {
  type: 'vehicle';
  
  physics: {
    mass: number;
    maxSpeed: number;
    acceleration: number;
    braking: number;
    turning: number;
    suspension?: BlueprintRecord;
  };
  
  seats: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    isDriver: boolean;
  }>;
  
  animations: {
    idle: string;
    moving?: string;
    wheels?: string[];
  };
};

export type AirplaneBlueprint = Blueprint & {
  type: 'airplane';
  
  physics: {
    mass: number;
    maxSpeed: number;
    acceleration: number;
    turning: number;
    lift: number;
    drag: number;
  };
  
  seats: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    isDriver: boolean;
  }>;
  
  animations: {
    idle: string;
    flying?: string;
    propeller?: string;
  };
};

export type AnimationSequence = Blueprint & {
  type: 'animation-sequence';
  
  clips: Array<{
    name: string;
    file: string;
    duration: number;
    loop?: boolean;
    events?: Array<{
      time: number;
      type: string;
      data?: BlueprintRecord;
    }>;
  }>;
  
  transitions?: Array<{
    from: string;
    to: string;
    duration: number;
    condition?: string;
  }>;
};

export type BehaviorTree = Blueprint & {
  type: 'behavior-tree';
  
  root: BehaviorNode;
  blackboard?: BlueprintRecord;
};

export type BehaviorNode = {
  type: 'sequence' | 'selector' | 'parallel' | 'action' | 'condition';
  children?: BehaviorNode[];
  action?: string;
  condition?: string;
  parameters?: BlueprintRecord;
};

export type ItemBlueprint = Blueprint & {
  type: 'item';
  
  category: 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';
  
  properties: {
    stackable: boolean;
    maxStack?: number;
    weight?: number;
    value?: number;
  };
  
  effects?: Array<{
    type: string;
    value: number;
    duration?: number;
  }>;
  
  visuals?: {
    icon: string;
    model?: string;
    scale?: number;
  };
};

export type BlueprintComponent = {
  id: string;
  type: string;
  [key: string]: BlueprintValue;
};

export type BlueprintWithComponents = AnyBlueprint & {
  components?: BlueprintComponent[];
};

export type AnyBlueprint = 
  | CharacterBlueprint 
  | VehicleBlueprint 
  | AirplaneBlueprint 
  | AnimationSequence 
  | BehaviorTree 
  | ItemBlueprint; 
