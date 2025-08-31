// Core
export * from './core';

// Hooks  
export * from './hooks';

// Components
export * from './components';

// Config
export * from './config';

// Types
export * from './types';

// Stores
export * from './stores';

// Bridge
export * from './bridge';

// Specific exports for better tree-shaking
export { usePlayerNetwork } from './hooks/usePlayerNetwork';
export { useMultiplayer } from './hooks/useMultiplayer';
export { RemotePlayer } from './components/RemotePlayer';
export { ConnectionForm } from './components/ConnectionForm';
export { PlayerInfoOverlay } from './components/PlayerInfoOverlay';
export { MultiplayerCanvas } from './components/MultiplayerCanvas';
export { PlayerNetworkManager } from './core/PlayerNetworkManager';
export { PlayerPositionTracker } from './core/PlayerPositionTracker';
export { defaultMultiplayerConfig } from './config/defaultConfig';
export type { PlayerState, MultiplayerConfig, MultiplayerConnectionOptions, MultiplayerState } from './types'; 