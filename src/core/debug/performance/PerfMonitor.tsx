import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  PerfMonitorProps,
  PerformanceData,
  PerformanceWithMemory,
  GPUInfo,
  NetworkInfo,
  RapierInfo,
} from './types';
import './styles.css';

export function PerfMonitor({
  position = 'top-right',
  updateInterval = 500,
  visible = true,
  zIndex = 10001,
  enableGPUInfo = true,
  enableNetworkInfo = true,
  enableRapierInfo = true,
  historyLength = 60,
}: PerfMonitorProps) {
  const [perfData, setPerfData] = useState<PerformanceData>({
    frame: {
      fps: 0,
      frameTime: 0,
      minFps: Infinity,
      maxFps: 0,
      avgFps: 0,
      frameTimes: [],
      cpuTime: 0,
      gpuTime: 0,
    },
    memory: { used: 0, total: 0, limit: 0, percentage: 0 },
    webgl: {
      textures: 0,
      geometries: 0,
      programs: 0,
      drawCalls: 0,
      triangles: 0,
      lines: 0,
      points: 0,
    },
    timestamp: 0,
  });

  const { gl, scene } = useThree();

  const frameCountRef = useRef(0);
  const frameTimesRef = useRef<number[]>([]);
  const fpsHistoryRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const lastUpdateRef = useRef(performance.now());
  const performanceWithMemory = performance as PerformanceWithMemory;
  const gpuInfoRef = useRef<GPUInfo | null>(null);
  const networkInfoRef = useRef<NetworkInfo | null>(null);

  const getRapierInfo = (): RapierInfo | undefined => {
    if (!enableRapierInfo) return undefined;

    try {
      const rapierElements = document.querySelectorAll('[data-rapier]');
      const rigidBodies = document.querySelectorAll('[data-rigid-body]');
      const colliders = document.querySelectorAll('[data-collider]');

      return {
        rigidBodies: rigidBodies.length,
        colliders: colliders.length,
        joints: 0,
        islandCount: 0,
        stepTime: 0,
      };
    } catch (error) {
      return undefined;
    }
  };

  useEffect(() => {
    if (enableGPUInfo && !gpuInfoRef.current) {
      const canvas = gl.domElement;
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (context) {
        const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
        const maxTextures = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
        const maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
        const maxVertexTextures = context.getParameter(context.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        const maxCombinedTextures = context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        gpuInfoRef.current = {
          vendor: debugInfo ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
          renderer: debugInfo ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
          maxTextures,
          maxTextureSize,
          maxVertexTextures,
          maxCombinedTextures,
          extensions: context.getSupportedExtensions() || [],
        };
      }
    }

    if (enableNetworkInfo && !networkInfoRef.current) {
      const connection = (navigator as any).connection;
      if (connection) {
        networkInfoRef.current = {
          type: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        };
      }
    }
  }, [gl, enableGPUInfo, enableNetworkInfo]);

  useFrame(() => {
    frameCountRef.current++;
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    frameTimesRef.current.push(deltaTime);

    if (frameTimesRef.current.length > historyLength) {
      frameTimesRef.current.shift();
    }

    lastTimeRef.current = now;

    if (now - lastUpdateRef.current >= updateInterval) {
      const currentFps = Math.round(1000 / deltaTime);
      fpsHistoryRef.current.push(currentFps);

      if (fpsHistoryRef.current.length > historyLength) {
        fpsHistoryRef.current.shift();
      }

      const avgFps =
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      const minFps = Math.min(...fpsHistoryRef.current);
      const maxFps = Math.max(...fpsHistoryRef.current);

      let memoryInfo = { used: 0, total: 0, limit: 0, percentage: 0 };
      if (performanceWithMemory.memory) {
        const used =
          Math.round((performanceWithMemory.memory.usedJSHeapSize / 1048576) * 100) / 100;
        const total =
          Math.round((performanceWithMemory.memory.totalJSHeapSize / 1048576) * 100) / 100;
        const limit =
          Math.round((performanceWithMemory.memory.jsHeapSizeLimit / 1048576) * 100) / 100;
        memoryInfo = {
          used,
          total,
          limit,
          percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
        };
      }

      const info = gl.info;
      const webglInfo = {
        textures: info.memory.textures,
        geometries: info.memory.geometries,
        programs: info.programs?.length || 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        lines: info.render.lines || 0,
        points: info.render.points || 0,
      };

      const rapierInfo = getRapierInfo();
      const avgFrameTime =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;

      setPerfData({
        frame: {
          fps: currentFps,
          frameTime: Math.round(deltaTime * 100) / 100,
          minFps: Math.round(minFps),
          maxFps: Math.round(maxFps),
          avgFps: Math.round(avgFps * 10) / 10,
          frameTimes: [...frameTimesRef.current],
          cpuTime: Math.round(avgFrameTime * 100) / 100,
          gpuTime: 0,
        },
        memory: memoryInfo,
        webgl: webglInfo,
        gpu: gpuInfoRef.current || undefined,
        network: networkInfoRef.current || undefined,
        rapier: rapierInfo,
        timestamp: now,
      });

      lastUpdateRef.current = now;
      frameCountRef.current = 0;

      gl.info.reset();
    }
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible && !containerRef.current) {
      const container = document.createElement('div');
      container.id = 'perf-monitor-advanced';
      document.body.appendChild(container);
      containerRef.current = container;
    } else if (!visible && containerRef.current) {
      document.body.removeChild(containerRef.current);
      containerRef.current = null;
    }
  }, [visible]);

  useEffect(() => {
    if (!containerRef.current || !visible) return;

    const container = containerRef.current;
    container.className = `perf-monitor-container advanced ${position}`;
    container.style.zIndex = zIndex.toString();

    const getFpsColor = (fps: number) => {
      if (fps >= 55) return '#00ff88';
      if (fps >= 30) return '#ffaa00';
      return '#ff4444';
    };

    const getMemoryColor = (percentage: number) => {
      if (percentage < 60) return '#00ff88';
      if (percentage < 80) return '#ffaa00';
      return '#ff4444';
    };

    const frameTimeColor = perfData.frame.frameTime < 20 ? '#00ff88' : '#ffaa00';

    const fpsSparkline = perfData.frame.frameTimes
      .slice(-30)
      .map((time) => {
        const fps = 1000 / time;
        const height = Math.max(2, Math.min(16, (fps / 60) * 16));
        const color = getFpsColor(fps);
        return `<div class="sparkline-bar" style="height: ${height}px; background: ${color};"></div>`;
      })
      .join('');

    const exportData = () => {
      const data = {
        performance: perfData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    container.innerHTML = `
      <div class="perf-monitor-header">
        <strong>🔥 Performance Monitor</strong>
        <div class="perf-monitor-timestamp">${new Date().toLocaleTimeString()}</div>
      </div>
      
      <div class="perf-monitor-section frame-section">
        <div class="metric-row">
          <span class="metric-label">FPS:</span>
          <span style="color: ${getFpsColor(perfData.frame.fps)}">${perfData.frame.fps}</span>
          <span class="metric-minmax">(${perfData.frame.minFps}-${perfData.frame.maxFps})</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Avg:</span>
          <span style="color: ${getFpsColor(perfData.frame.avgFps)}">${perfData.frame.avgFps}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Frame:</span>
          <span style="color: ${frameTimeColor}">${perfData.frame.frameTime}ms</span>
        </div>
        <div class="sparkline-container">
          <div class="sparkline">${fpsSparkline}</div>
        </div>
      </div>

      <div class="perf-monitor-section memory-section">
        <div class="section-title">💾 Memory</div>
        <div class="metric-row">
          <span class="metric-label">Used:</span>
          <span style="color: ${getMemoryColor(perfData.memory.percentage)}">${perfData.memory.used}MB</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total:</span>
          <span>${perfData.memory.total}MB</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Usage:</span>
          <span style="color: ${getMemoryColor(perfData.memory.percentage)}">${perfData.memory.percentage}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${perfData.memory.percentage}%; background-color: ${getMemoryColor(perfData.memory.percentage)}"></div>
        </div>
      </div>

      <div class="perf-monitor-section webgl-section">
        <div class="section-title">🎮 WebGL</div>
        <div class="metric-grid">
          <div>Textures: <span class="metric-value">${perfData.webgl.textures}</span></div>
          <div>Geometries: <span class="metric-value">${perfData.webgl.geometries}</span></div>
          <div>Programs: <span class="metric-value">${perfData.webgl.programs}</span></div>
          <div>Draw Calls: <span class="metric-value">${perfData.webgl.drawCalls}</span></div>
          <div>Triangles: <span class="metric-value">${perfData.webgl.triangles}</span></div>
          <div>Lines: <span class="metric-value">${perfData.webgl.lines}</span></div>
        </div>
      </div>

      ${
        perfData.gpu
          ? `
        <div class="perf-monitor-section gpu-section">
          <div class="section-title">🔧 GPU</div>
          <div class="metric-row small">
            <span class="metric-label">Vendor:</span>
            <span class="metric-value-small">${perfData.gpu.vendor.substring(0, 15)}</span>
          </div>
          <div class="metric-row small">
            <span class="metric-label">Device:</span>
            <span class="metric-value-small">${perfData.gpu.renderer.substring(0, 15)}</span>
          </div>
          <div class="metric-row small">
            <span class="metric-label">Max Tex:</span>
            <span class="metric-value">${perfData.gpu.maxTextures}</span>
          </div>
        </div>
      `
          : ''
      }

      ${
        perfData.network
          ? `
        <div class="perf-monitor-section network-section">
          <div class="section-title">🌐 Network</div>
          <div class="metric-row small">
            <span class="metric-label">Type:</span>
            <span class="metric-value-small">${perfData.network.effectiveType}</span>
          </div>
          <div class="metric-row small">
            <span class="metric-label">Speed:</span>
            <span class="metric-value">${perfData.network.downlink}Mbps</span>
          </div>
          <div class="metric-row small">
            <span class="metric-label">RTT:</span>
            <span class="metric-value">${perfData.network.rtt}ms</span>
          </div>
        </div>
      `
          : ''
      }

      ${
        perfData.rapier
          ? `
        <div class="perf-monitor-section physics-section">
          <div class="section-title">⚡ Physics</div>
          <div class="metric-grid">
            <div>Bodies: <span class="metric-value">${perfData.rapier.rigidBodies}</span></div>
            <div>Colliders: <span class="metric-value">${perfData.rapier.colliders}</span></div>
            <div>Joints: <span class="metric-value">${perfData.rapier.joints}</span></div>
            <div>Islands: <span class="metric-value">${perfData.rapier.islandCount}</span></div>
            <div>Step: <span class="metric-value">${perfData.rapier.stepTime}ms</span></div>
          </div>
        </div>
      `
          : ''
      }
    `;
  }, [perfData, position, zIndex, visible]);

  return null;
}
