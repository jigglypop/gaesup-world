import { UIState, UICommand } from '../types';
export declare class UISystem {
    private state;
    private minimapSystem;
    private listeners;
    constructor();
    getState(): UIState;
    execute(command: UICommand): void;
    subscribe(listener: () => void): () => void;
    private notifyListeners;
    dispose(): void;
    getMetrics(): {
        notificationCount: number;
        isMinimapVisible: boolean;
        isHudVisible: boolean;
        isTooltipVisible: boolean;
        isModalVisible: boolean;
        lastUpdate: number;
    };
}
