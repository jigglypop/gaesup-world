import { MinimapProps, MinimapResult } from '../components/Minimap/types';
export interface UseMinimapReturnType {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    scale: number;
    upscale: () => void;
    downscale: () => void;
    handleWheel: (e: React.WheelEvent) => void;
    setupWheelListener: () => void;
    updateCanvas: () => void;
    isReady: boolean;
}
export declare const useMinimap: (props: MinimapProps) => MinimapResult;
