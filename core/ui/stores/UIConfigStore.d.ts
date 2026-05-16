import { UIConfig } from '../types';
interface UIConfigStore {
    config: UIConfig;
    updateConfig: (partial: Partial<UIConfig>) => void;
    updateMinimapConfig: (config: Partial<UIConfig['minimap']>) => void;
    updateTooltipConfig: (config: Partial<UIConfig['tooltip']>) => void;
    updateHudConfig: (config: Partial<UIConfig['hud']>) => void;
    updateModalConfig: (config: Partial<UIConfig['modal']>) => void;
    updateNotificationsConfig: (config: Partial<UIConfig['notifications']>) => void;
    updateSpeechBalloonConfig: (config: Partial<UIConfig['speechBalloon']>) => void;
    resetConfig: () => void;
}
export declare const useUIConfigStore: import("zustand").UseBoundStore<import("zustand").StoreApi<UIConfigStore>>;
export {};
