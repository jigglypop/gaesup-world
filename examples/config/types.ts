export interface FocusedObject {
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  type: string;
}
export interface ClickPosition {
  x: number;
  y: number;
  z: number;
}

export interface EditorMode {
  enabled: boolean;
  defaultLayout?: 'full' | 'minimal' | 'custom';
  panels?: {
    hierarchy?: boolean;
    inspector?: boolean;
    assetBrowser?: boolean;
    blueprints?: boolean;
  };
}

export interface ExampleConfig {
  editor: EditorMode;
  debug: boolean;
  showPerformance: boolean;
  showGrid: boolean;
  showAxes: boolean;
}

export type DevMode = {
  enable?: boolean;
  showStats?: boolean;
  showDebugInfo?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showColliders?: boolean;
};

export type EditorConfig = {
  enable?: boolean;
  panels?: {
    animation?: boolean;
    camera?: boolean;
    motion?: boolean;
    performance?: boolean;
    vehicle?: boolean;
    blueprints?: boolean;
  };
};
