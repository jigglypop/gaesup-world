import { type RefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import { MultiplayerConnectionOptions, MultiplayerState, MultiplayerConfig } from '../types';
interface UseMultiplayerOptions {
    config: MultiplayerConfig;
    characterUrl?: string;
    rigidBodyRef?: RefObject<RapierRigidBody>;
}
interface UseMultiplayerResult extends MultiplayerState {
    connect: (options: MultiplayerConnectionOptions) => void;
    disconnect: () => void;
    startTracking: (playerRef: RefObject<RapierRigidBody>) => void;
    stopTracking: () => void;
    updateConfig: (config: Partial<MultiplayerConfig>) => void;
    sendChat: (text: string, options?: {
        range?: number;
        ttlMs?: number;
    }) => void;
    speechByPlayerId: Map<string, string>;
    localSpeechText: string | null;
}
export declare function useMultiplayer(options: UseMultiplayerOptions): UseMultiplayerResult;
export {};
