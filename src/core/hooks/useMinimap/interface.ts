import { RefObject } from "react";

export interface MinimapResult {
  canvasRef: RefObject<HTMLCanvasElement>;
  scale: number;
  upscale: () => void;
  downscale: () => void;
  handleWheel: (e: WheelEvent) => void;
  setupWheelListener: () => (() => void) | undefined;
  updateCanvas: () => void;
  isReady: boolean;
}
