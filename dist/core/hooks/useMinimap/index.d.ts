import { MinimapProps } from '../../ui/components/Minimap/types';
export interface MinimapResult {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    scale: number;
    upscale: () => void;
    downscale: () => void;
    handleWheel: (e: React.WheelEvent) => void;
    setupWheelListener: () => (() => void) | undefined;
    updateCanvas: () => void;
    isReady: boolean;
}
export declare const useMinimap: (props: MinimapProps) => MinimapResult;
