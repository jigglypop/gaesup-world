export interface FocusedObject {
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  type: string;
}
export interface PlatformData {
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  type: string;
  label: string;
}
export interface ClickPosition {
  x: number;
  y: number;
  z: number;
}
export type TabId = 'controls' | 'features' | 'locations';
