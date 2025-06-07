import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerfMonitorProps, PerformanceData, PerformanceWithMemory } from './types';
import './styles.css';

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
  const performanceWithMemory = performance as PerformanceWithMemory;

  useFrame(() => {
    frameCountRef.current++;
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (now - lastUpdateRef.current >= updateInterval) {
      const fps = Math.round(1000 / deltaTime);
      let memoryInfo = { used: 0, total: 0, limit: 0 };
      if (performanceWithMemory.memory) {
        memoryInfo = {
          used: Math.round((performanceWithMemory.memory.usedJSHeapSize / 1048576) * 100) / 100,
          total: Math.round((performanceWithMemory.memory.totalJSHeapSize / 1048576) * 100) / 100,
          limit: Math.round((performanceWithMemory.memory.jsHeapSizeLimit / 1048576) * 100) / 100,
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

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible && !containerRef.current) {
      const container = document.createElement('div');
      container.id = 'perf-monitor';
      document.body.appendChild(container);
      containerRef.current = container;
    } else if (!visible && containerRef.current) {
      document.body.removeChild(containerRef.current);
      containerRef.current = null;
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !containerRef.current) return;

    const container = containerRef.current;
    container.className = `perf-monitor-container ${position}`;
    container.style.zIndex = String(zIndex);

    const hasMemory = !!performanceWithMemory.memory;
    const fpsColor = perfData.fps >= 60 ? '#0f8' : perfData.fps >= 30 ? '#ff8' : '#f08';
    const frameTimeColor =
      perfData.frameTime <= 16.67 ? '#0f8' : perfData.frameTime <= 33.33 ? '#ff8' : '#f08';
    const memoryPercentage =
      perfData.memory.limit > 0
        ? `${Math.round((perfData.memory.used / perfData.memory.limit) * 100)}% used`
        : 'N/A';

    const memoryHtml = hasMemory
      ? `
        <div class="perf-monitor-memory-section">
          <div class="perf-monitor-memory-title">Memory</div>
          <div class="perf-monitor-memory-value">
            ${perfData.memory.used}MB / ${perfData.memory.limit}MB
          </div>
          <div class="perf-monitor-memory-usage">
            ${memoryPercentage}
          </div>
        </div>
      `
      : '';

    container.innerHTML = `
      <div class="perf-monitor-header">
        <strong>Performance</strong>
      </div>
      <div class="perf-monitor-section">
        <div style="color: ${fpsColor}">${perfData.fps} FPS</div>
        <div style="color: ${frameTimeColor}">${perfData.frameTime}ms</div>
      </div>
      ${memoryHtml}
      <div class="perf-monitor-webgl-section">
        <div class="perf-monitor-webgl-title">WebGL</div>
        <div class="perf-monitor-webgl-metrics">
          Tex: ${perfData.webgl.textures} | Geo: ${perfData.webgl.geometries}
        </div>
        <div class="perf-monitor-webgl-calls">
          Calls: ${perfData.webgl.drawCalls} | Tri: ${(perfData.webgl.triangles / 1000).toFixed(1)}k
        </div>
      </div>
    `;
  }, [perfData, position, zIndex, visible, performanceWithMemory]);

  return null;
}
