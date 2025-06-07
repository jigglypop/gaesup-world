export interface PerfMonitorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  updateInterval?: number;
  visible?: boolean;
  zIndex?: number;
}

export interface PerformanceData {
  fps: number;
  frameTime: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  webgl: {
    textures: number;
    geometries: number;
    programs: number;
    drawCalls: number;
    triangles: number;
  };
}

export interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}
