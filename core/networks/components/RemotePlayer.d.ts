import React from 'react';
import { PlayerState, MultiplayerConfig } from '../types';
interface RemotePlayerProps {
    playerId: string;
    state: PlayerState;
    characterUrl?: string;
    config?: MultiplayerConfig;
    speechText?: string;
}
export declare const RemotePlayer: React.NamedExoticComponent<RemotePlayerProps>;
export {};
