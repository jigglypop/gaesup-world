import * as THREE from 'three';

export type SpeechBalloonProps = {
  text: string;
  position?: THREE.Vector3;
  offset?: THREE.Vector3;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  maxWidth?: number;
  visible?: boolean;
  opacity?: number;
  children?: React.ReactNode;
};

export type SpeechBalloonState = {
  canvasTexture: THREE.CanvasTexture | null;
  spriteScale: THREE.Vector3;
}; 