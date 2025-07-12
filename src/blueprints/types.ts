export type Blueprint = {
  id: string;
  name: string;
  description?: string;
  version: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
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
    data: unknown;
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
    model: string;
    textures?: string[];
    materials?: Record<string, unknown>;
    scale?: number;
  };
};

export type VehicleBlueprint = Blueprint & {
  type: 'vehicle';
  
  physics: {
    mass: number;
    maxSpeed: number;
    acceleration: number;
    braking: number;
    turning: number;
    suspension?: unknown;
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
      data?: unknown;
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
  blackboard?: Record<string, unknown>;
};

export type BehaviorNode = {
  type: 'sequence' | 'selector' | 'parallel' | 'action' | 'condition';
  children?: BehaviorNode[];
  action?: string;
  condition?: string;
  parameters?: Record<string, unknown>;
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
  [key: string]: unknown;
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