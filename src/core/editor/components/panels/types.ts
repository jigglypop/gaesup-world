export type AnimationPanelTab = 'Player' | 'Controller' | 'Debug';
export type CameraPanelTab = 'Controller' | 'Presets' | 'Debug';
export type MotionPanelTab = 'Controller' | 'Debug';

export type FSMNode = {
  id: string;
  label: string;
  position: { x: number; y: number };
} 