export type TabId = 'controls' | 'features' | 'locations';

export interface ControlItem {
  key: string;
  description: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Location {
  icon: string;
  name: string;
  description: string;
}

export interface Tab {
  id: string;
  label: string;
  emoji: string;
}
