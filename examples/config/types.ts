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
    nodeEditor?: boolean;
  };
}

export interface ExampleConfig {
  editor: EditorMode;
  debug: boolean;
  showPerformance: boolean;
}
