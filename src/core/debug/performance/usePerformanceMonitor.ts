import { useRef, useCallback, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerformanceMetrics } from './types';

export function usePerformanceMonitor(historyLength = 120) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const frameTimesRef = useRef<number[]>([]);
  const fpsHistoryRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const gcEventCountRef = useRef(0);

  const measureCPU = useCallback(() => {
    const start = performance.now();

    let count = 0;
    const cpuStart = performance.now();
    while (performance.now() - cpuStart < 1) {
      count++;
    }

    return {
      mainThread: performance.now() - start,
      worker: 0,
      idle: Math.max(0, 16.67 - (performance.now() - start)),
    };
  }, []);

  const measureMemory = useCallback(() => {
    const perf = performance as any;
    if (perf.memory) {
      const used = perf.memory.usedJSHeapSize / 1048576;
      const total = perf.memory.totalJSHeapSize / 1048576;
      const limit = perf.memory.jsHeapSizeLimit / 1048576;

      const previousUsed = metrics?.memory.used || 0;
      if (used < previousUsed * 0.9) {
        gcEventCountRef.current++;
      }

      return {
        used: Math.round(used * 100) / 100,
        total: Math.round(total * 100) / 100,
        limit: Math.round(limit * 100) / 100,
        percentage: Math.round((used / limit) * 100),
        gcEvents: gcEventCountRef.current,
      };
    }
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
      gcEvents: 0,
    };
  }, [metrics]);

  const measureGPU = useCallback(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const memoryInfo = gl.getExtension('WEBGL_memory_info_webgl');

      return {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
        memory: memoryInfo
          ? gl.getParameter(memoryInfo.MEMORY_INFO_DEDICATED_VIDMEM_WEBGL)
          : undefined,
        textureMemory: memoryInfo
          ? gl.getParameter(memoryInfo.MEMORY_INFO_CURRENT_AVAILABLE_VIDMEM_WEBGL)
          : undefined,
      };
    }

    return {
      vendor: 'Unknown',
      renderer: 'Unknown',
    };
  }, []);

  const measureNetwork = useCallback(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      return {
        rtt: connection.rtt || 0,
        bandwidth: connection.downlink || 0,
        effectiveType: connection.effectiveType || 'unknown',
      };
    }
    return {
      rtt: 0,
      bandwidth: 0,
      effectiveType: 'unknown',
    };
  }, []);

  const calculatePercentile = useCallback((arr: number[], percentile: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }, []);

  useFrame(() => {
    frameCountRef.current++;
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;

    frameTimesRef.current.push(deltaTime);
    if (frameTimesRef.current.length > historyLength) {
      frameTimesRef.current.shift();
    }

    const currentFps = Math.round(1000 / deltaTime);
    fpsHistoryRef.current.push(currentFps);
    if (fpsHistoryRef.current.length > historyLength) {
      fpsHistoryRef.current.shift();
    }

    lastTimeRef.current = now;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (frameTimesRef.current.length === 0 || fpsHistoryRef.current.length === 0) return;

      const avgFrameTime =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const avgFps =
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;

      const newMetrics: PerformanceMetrics = {
        fps: {
          current: fpsHistoryRef.current[fpsHistoryRef.current.length - 1] || 0,
          average: Math.round(avgFps * 10) / 10,
          min: Math.min(...fpsHistoryRef.current),
          max: Math.max(...fpsHistoryRef.current),
          history: [...fpsHistoryRef.current],
        },
        frameTime: {
          current: frameTimesRef.current[frameTimesRef.current.length - 1] || 0,
          average: Math.round(avgFrameTime * 100) / 100,
          p95: calculatePercentile(frameTimesRef.current, 95),
          p99: calculatePercentile(frameTimesRef.current, 99),
          history: [...frameTimesRef.current],
        },
        memory: measureMemory(),
        cpu: measureCPU(),
        gpu: measureGPU(),
        network: measureNetwork(),
      };

      setMetrics(newMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [calculatePercentile, measureCPU, measureMemory, measureGPU, measureNetwork]);

  const exportData = useCallback(() => {
    if (!metrics) return;

    const data = {
      metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        devicePixelRatio: window.devicePixelRatio,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics]);

  return {
    metrics,
    exportData,
  };
}
