import { WorldObject } from '@core/world/types';

export interface ActiveObject extends WorldObject {
  type: 'character' | 'vehicle' | 'airplane';
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  speed: number;
  maxSpeed: number;
  isControlled?: boolean;
  controllerId?: string;
}

export interface ActiveObjectProps {
  objects: ActiveObject[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableSelection?: boolean;
  showHealthBars?: boolean;
  showEnergyBars?: boolean;
}

export interface ObjectComponentProps {
  object: ActiveObject;
  selected?: boolean;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
}
