import React, { useState, useEffect, useRef } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';

// A more robust Sparkline component
const Sparkline: React.FC<{ data: number[]; color: string; max: number }> = ({ data, color, max }) => {
  const height = 40;
  const validData = data.filter(n => isFinite(n));
  if (validData.length < 2) return null; // Cannot draw a line with less than 2 points

  const safeMax = Math.max(1, max); // Avoid division by zero
  const path = validData
    .map((d, i) => {
      const x = (i / (validData.length - 1)) * 100;
      const y = height - (d / safeMax) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="perf-chart">
      <svg width="100%" height={height} preserveAspectRatio="none" viewBox="0 0 100 40">
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export function PerformancePanel() {
  const performanceData = useGaesupStore((state) => state.performance);
  const [fps, setFps] = useState({ current: 0, min: Infinity, max: 0, avg: 0, history: Array(50).fill(0) });
  const [mem, setMem] = useState({ used: 0, limit: 0, history: Array(50).fill(0) });
  const [frameTime, setFrameTime] = useState(0);

  const lastUpdateTime = useRef(0);
  const lastFrameTime = useRef(0);
  const frameCount = useRef(0);
  const frameTimeHistory = useRef<number[]>([]);
  const animationFrameRef = useRef<number>(null);

  useEffect(() => {
    const now = window.performance.now();
    lastUpdateTime.current = now;
    lastFrameTime.current = now;

    const updatePerformance = (now: number) => {
      // Calculate responsive frame time on every frame
      const delta = now - lastFrameTime.current;
      lastFrameTime.current = now;
      frameTimeHistory.current.push(delta);
      if (frameTimeHistory.current.length > 30) {
        frameTimeHistory.current.shift();
      }
      const avgFrameTime =
        frameTimeHistory.current.reduce((a, b) => a + b, 0) /
        frameTimeHistory.current.length;
      setFrameTime(avgFrameTime);
      frameCount.current++;
      // Update less frequent stats (FPS, Mem) every 500ms
      if (now - lastUpdateTime.current >= 500) {
        const currentFps =
          (frameCount.current * 1000) / (now - lastUpdateTime.current);

        setFps((prev) => {
          const newHistory = [...prev.history.slice(1), currentFps];
          const newMin = Math.min(
            prev.min === Infinity ? currentFps : prev.min,
            currentFps,
          );
          const newMax = Math.max(prev.max, currentFps);
          const newAvg =
            newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
          return {
            current: currentFps,
            min: newMin,
            max: newMax,
            avg: newAvg,
            history: newHistory,
          };
        });

        const memoryInfo = (window.performance as any).memory;
        if (memoryInfo) {
          setMem((prev) => {
            const used = Math.round(memoryInfo.usedJSHeapSize / 1048576);
            const limit = Math.round(memoryInfo.jsHeapSizeLimit / 1048576);
            const newHistory = [...prev.history.slice(1), used];
            return { used, limit, history: newHistory };
          });
        }

        lastUpdateTime.current = now;
        frameCount.current = 0;
      }
      animationFrameRef.current = requestAnimationFrame(updatePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(updatePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getFpsColor = (f: number) => (f >= 55 ? '#4ade80' : f >= 30 ? '#facc15' : '#f87171');
  const getMemoryColor = (u: number, l: number) => {
    const p = l > 0 ? (u / l) * 100 : 0;
    return p < 60 ? '#4ade80' : p < 80 ? '#facc15' : '#f87171';
  };
  
  return (
    <div className="perf-panel">
      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">Frame Rate (FPS)</h4>
          <span className="perf-current" style={{ color: getFpsColor(fps.current) }}>
            {fps.current.toFixed(0)}
          </span>
        </div>
        <div className="perf-details-grid">
          <div><span className="perf-label">Avg</span>{fps.avg.toFixed(1)}</div>
          <div><span className="perf-label">Min</span>{isFinite(fps.min) ? fps.min.toFixed(1) : '...'}</div>
          <div><span className="perf-label">Max</span>{fps.max.toFixed(1)}</div>
          <div><span className="perf-label">Time</span>{frameTime.toFixed(1)} ms</div>
        </div>
        <Sparkline data={fps.history} color={getFpsColor(fps.current)} max={90} />
      </div>

      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">Memory (MB)</h4>
          <span className="perf-current" style={{ color: getMemoryColor(mem.used, mem.limit) }}>
            {mem.used}
          </span>
        </div>
        <div className="perf-details-grid">
          <div><span className="perf-label">Limit</span>{mem.limit}</div>
          <div><span className="perf-label">Usage</span>{mem.limit > 0 ? ((mem.used / mem.limit) * 100).toFixed(0) : 0}%</div>
        </div>
        <Sparkline data={mem.history} color={getMemoryColor(mem.used, mem.limit)} max={mem.limit || 1} />
      </div>

      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">Rendering</h4>
        </div>
        <div className="perf-details-grid">
          <div><span className="perf-label">Draws</span>{performanceData.render.calls}</div>
          <div><span className="perf-label">Tris</span>{(performanceData.render.triangles / 1000).toFixed(1)}K</div>
          <div><span className="perf-label">Geometries</span>{performanceData.engine.geometries}</div>
          <div><span className="perf-label">Textures</span>{performanceData.engine.textures}</div>
        </div>
      </div>
    </div>
  );
} 