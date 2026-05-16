import React from 'react';
import { type RapierRigidBody } from '@react-three/rapier';
import { PlayerState, MultiplayerConfig } from '../types';
declare global {
    interface Window {
        CHARACTER_URL?: string;
    }
}
interface MultiplayerCanvasProps {
    players: Map<string, PlayerState>;
    characterUrl: string;
    vehicleUrl: string;
    airplaneUrl: string;
    playerRef: React.RefObject<RapierRigidBody>;
    config: MultiplayerConfig;
    localPlayerColor?: string;
    proximityRange?: number;
    speechByPlayerId?: Map<string, string>;
    localSpeechText?: string | null;
}
export declare const MultiplayerCanvas: React.NamedExoticComponent<MultiplayerCanvasProps>;
export {};
