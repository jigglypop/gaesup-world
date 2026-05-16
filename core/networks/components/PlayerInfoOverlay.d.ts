import React from 'react';
import { MultiplayerState } from '../types';
interface PlayerInfoOverlayProps {
    state: MultiplayerState;
    playerName?: string;
    onDisconnect: () => void;
    onSendChat?: (text: string) => void;
}
export declare function PlayerInfoOverlay({ state, playerName, onDisconnect, onSendChat }: PlayerInfoOverlayProps): React.JSX.Element | null;
export {};
