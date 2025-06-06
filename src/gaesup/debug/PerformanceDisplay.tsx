import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

interface PerfMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  updateInterval?: number;
  visible?: boolean;
  zIndex?: number;
}

interface PerformanceData {
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

export function PerfMonitor({
  position = 'top-right',
  updateInterval = 1000,
  visible = true,
  zIndex = 10001,
}: PerfMonitorProps) {
  const [perfData, setPerfData] = useState<PerformanceData>({
    fps: 0,
    frameTime: 0,
    memory: { used: 0, total: 0, limit: 0 },
    webgl: { textures: 0, geometries: 0, programs: 0, drawCalls: 0, triangles: 0 },
  });

  const { gl } = useThree();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastUpdateRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current++;
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (now - lastUpdateRef.current >= updateInterval) {
      const fps = Math.round(1000 / deltaTime);
      let memoryInfo = { used: 0, total: 0, limit: 0 };
      if (performance.memory) {
        memoryInfo = {
          used: Math.round((performance.memory.usedJSHeapSize / 1048576) * 100) / 100,
          total: Math.round((performance.memory.totalJSHeapSize / 1048576) * 100) / 100,
          limit: Math.round((performance.memory.jsHeapSizeLimit / 1048576) * 100) / 100,
        };
      }
      const info = gl.info;
      const webglInfo = {
        textures: info.memory.textures,
        geometries: info.memory.geometries,
        programs: info.programs?.length || 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
      };

      setPerfData({
        fps,
        frameTime: Math.round(deltaTime * 100) / 100,
        memory: memoryInfo,
        webgl: webglInfo,
      });

      lastUpdateRef.current = now;
      frameCountRef.current = 0;
    }
  });
  if (!visible) return null;
  const positionStyle = {
    position: 'fixed' as const,
    zIndex,
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#ffffff',
    padding: '6px',
    borderRadius: '3px',
    border: '1px solid #444',
    minWidth: '160px',
    maxWidth: '180px',
    ...(() => {
      switch (position) {
        case 'top-left':
          return { top: '10px', left: '10px' };
        case 'top-right':
          return { top: '10px', right: '10px' };
        case 'bottom-left':
          return { bottom: '10px', left: '10px' };
        case 'bottom-right':
          return { bottom: '10px', right: '10px' };
        default:
          return { top: '10px', right: '10px' };
      }
    })(),
  };
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'perf-monitor';
    Object.assign(container.style, positionStyle);
    document.body.appendChild(container);
    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, [position, zIndex]);
  useEffect(() => {
    const container = document.getElementById('perf-monitor');
    if (!container) return;
    container.innerHTML = `
      <div style="border-bottom: 1px solid #555; padding-bottom: 2px; margin-bottom: 4px; font-size: 9px;">
        <strong>⚡ Performance</strong>
      </div>

      <div style="margin-bottom: 4px;">
        <div style="color: ${perfData.fps >= 60 ? '#0f8' : perfData.fps >= 30 ? '#ff8' : '#f08'}">
          📊 ${perfData.fps} FPS
        </div>
        <div style="color: ${perfData.frameTime <= 16.67 ? '#0f8' : perfData.frameTime <= 33.33 ? '#ff8' : '#f08'}">
          ⏱️ ${perfData.frameTime}ms
        </div>
      </div>

      ${
        performance.memory
          ? `
        <div style="margin-bottom: 4px; border-top: 1px solid #333; padding-top: 3px;">
          <div style="color: #f08; font-size: 9px;">💾 Memory</div>
          <div style="color: #ff8">${perfData.memory.used}MB / ${perfData.memory.limit}MB</div>
          <div style="color: #80f">${Math.round((perfData.memory.used / perfData.memory.limit) * 100)}% used</div>
        </div>
      `
          : ''
      }

      <div style="border-top: 1px solid #333; padding-top: 3px;">
        <div style="color: #8ff; font-size: 9px;">🎮 WebGL</div>
        <div style="color: #0f8">Tex: ${perfData.webgl.textures} | Geo: ${perfData.webgl.geometries}</div>
        <div style="color: #ff0">Calls: ${perfData.webgl.drawCalls} | Tri: ${(perfData.webgl.triangles / 1000).toFixed(1)}k</div>
      </div>
    `;
  }, [perfData]);
  return null;
}

export default PerfMonitor;
