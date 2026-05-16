import type { PlayerState } from '../types';
interface UsePlayerNetworkOptions {
    url: string;
    roomId: string;
    playerName: string;
    playerColor: string;
}
interface UsePlayerNetworkResult {
    isConnected: boolean;
    players: Map<string, PlayerState>;
    error: string | undefined;
    connect: (overrideOptions?: Partial<UsePlayerNetworkOptions>) => void;
    disconnect: () => void;
    updateLocalPlayer: (state: Partial<PlayerState>) => void;
}
export declare function usePlayerNetwork(defaultOptions: UsePlayerNetworkOptions): UsePlayerNetworkResult;
export {};
