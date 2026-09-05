import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import type { EditorPanelBaseProps } from './types';
import { useGaesupStore } from '../../../stores/gaesupStore';

const HISTORY_LEN = 60;

const Sparkline: React.FC<{ data: number[]; color: string; max: number; warn?: number }> = ({ data, color, max, warn }) => {
  const height = 40;
  const validData = data.filter(n => isFinite(n));
  if (validData.length < 2) return null;

  const safeMax = Math.max(1, max);
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
        {warn !== undefined && (
          <line
            x1="0" y1={height - (warn / safeMax) * height}
            x2="100" y2={height - (warn / safeMax) * height}
            stroke="#facc15" strokeWidth="0.5" strokeDasharray="3,3" opacity={0.5}
          />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const BarMeter: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
        <span className="perf-label">{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

export function PerformancePanel({ className = '', style, children }: EditorPanelBaseProps = {}) {
  const performanceData = useGaesupStore(useShallow((state) => state.performance));
  const [fps, setFps] = useState({ current: 0, min: Infinity, max: 0, avg: 0, p1Low: 0, history: Array(HISTORY_LEN).fill(0) });
  const [mem, setMem] = useState({ used: 0, limit: 0, history: Array(HISTORY_LEN).fill(0) });
  const [memoryAvailable, setMemoryAvailable] = useState(false);
  const [frameTime, setFrameTime] = useState(0);
  const [drawCallHistory, setDrawCallHistory] = useState<number[]>(Array(HISTORY_LEN).fill(0));
  const [frameTimeHistory, setFrameTimeHistory] = useState<number[]>(Array(HISTORY_LEN).fill(0));

  const lastUpdateTime = useRef(0);
  const lastFrameTime = useRef(0);
  const frameCount = useRef(0);
  const rawFrameTimes = useRef<number[]>([]);
  const startTime = useRef(0);
  const animationFrameRef = useRef<number>(null);
  const frameTimeAccumulator = useRef(0);
  const frameTimeUpdateCounter = useRef(0);
  const lastDrawCalls = useRef(0);

  const computeP1Low = useCallback((history: number[]): number => {
    if (history.length < 5) return 0;
    const sorted = [...history].filter(n => n > 0).sort((a, b) => a - b);
    const onePercent = Math.max(1, Math.floor(sorted.length * 0.01));
    let sum = 0;
    for (let i = 0; i < onePercent; i++) sum += sorted[i] ?? 0;
    return sum / onePercent;
  }, []);

  useEffect(() => {
    const now = window.performance.now();
    lastUpdateTime.current = now;
    lastFrameTime.current = now;
    startTime.current = now;

    const updatePerformance = (now: number) => {
      const delta = now - lastFrameTime.current;
      lastFrameTime.current = now;
      rawFrameTimes.current.push(delta);
      if (rawFrameTimes.current.length > 300) {
        rawFrameTimes.current.shift();
      }

      frameTimeAccumulator.current += delta;
      frameTimeUpdateCounter.current++;

      if (frameTimeUpdateCounter.current >= 10) {
        const avgFrameTime = frameTimeAccumulator.current / frameTimeUpdateCounter.current;
        setFrameTime(avgFrameTime);
        setFrameTimeHistory(prev => [...prev.slice(1), avgFrameTime]);
        frameTimeAccumulator.current = 0;
        frameTimeUpdateCounter.current = 0;
      }

      frameCount.current++;

      if (now - lastUpdateTime.current >= 500) {
        const currentFps = (frameCount.current * 1000) / (now - lastUpdateTime.current);
        const fpsFromFrameTimes = rawFrameTimes.current.map(t => t > 0 ? 1000 / t : 0);

        // Skip Min/Avg tracking during warmup (first 3s) to avoid init spike.
        const warmedUp = now - startTime.current > 3000;

        setFps((prev) => {
          const newHistory = [...prev.history.slice(1), currentFps];
          const newMin = warmedUp
            ? Math.min(prev.min === Infinity ? currentFps : prev.min, currentFps)
            : Infinity;
          const newMax = warmedUp ? Math.max(prev.max, currentFps) : 0;
          const validHistory = warmedUp ? newHistory.filter(n => n > 0) : [];
          const newAvg = validHistory.length > 0
            ? validHistory.reduce((a, b) => a + b, 0) / validHistory.length
            : currentFps;
          const p1Low = warmedUp ? computeP1Low(fpsFromFrameTimes) : currentFps;
          return { current: currentFps, min: newMin, max: newMax, avg: newAvg, p1Low, history: newHistory };
        });

        const memoryInfo = (window.performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }).memory;

        const hasMemory = Boolean(memoryInfo && Number.isFinite(memoryInfo.usedJSHeapSize)
          && memoryInfo.usedJSHeapSize >= 0 && Number.isFinite(memoryInfo.jsHeapSizeLimit)
          && memoryInfo.jsHeapSizeLimit > 0);
        setMemoryAvailable(hasMemory);
        if (memoryInfo && hasMemory) {
          setMem((prev) => {
            const used = Math.round(memoryInfo.usedJSHeapSize / 1048576);
            const limit = Math.round(memoryInfo.jsHeapSizeLimit / 1048576);
            return { used, limit, history: [...prev.history.slice(1), used] };
          });
        }

        lastUpdateTime.current = now;
        frameCount.current = 0;
      }
      animationFrameRef.current = requestAnimationFrame(updatePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(updatePerformance);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [computeP1Low]);

  // Track draw call history from store.
  useEffect(() => {
    const calls = performanceData.render.calls;
    if (calls !== lastDrawCalls.current) {
      lastDrawCalls.current = calls;
      setDrawCallHistory(prev => [...prev.slice(1), calls]);
    }
  }, [performanceData.render.calls]);

  const getFpsColor = (f: number) => (f >= 55 ? '#4ade80' : f >= 30 ? '#facc15' : '#f87171');
  const getFrameTimeColor = (t: number) => (t <= 16.7 ? '#4ade80' : t <= 33.3 ? '#facc15' : '#f87171');
  const getDrawCallColor = (d: number) => (d <= 100 ? '#4ade80' : d <= 300 ? '#facc15' : '#f87171');
  const getMemoryColor = (u: number, l: number) => {
    const p = l > 0 ? (u / l) * 100 : 0;
    return p < 60 ? '#4ade80' : p < 80 ? '#facc15' : '#f87171';
  };

  const triCount = performanceData.render.triangles;
  const drawCalls = performanceData.render.calls;
  const geoCount = performanceData.engine.geometries;
  const texCount = performanceData.engine.textures;

  return (
    <div className={`perf-panel ${className}`} style={style}>
      {/* FPS */}
      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">브라우저 초당 프레임</h4>
          <span className="perf-current" style={{ color: getFpsColor(fps.current) }}>
            {fps.current.toFixed(0)} FPS
          </span>
        </div>
        <div className="perf-details-grid">
          <div><span className="perf-label">평균</span>{fps.avg.toFixed(1)}</div>
          <div><span className="perf-label">최소</span>{isFinite(fps.min) ? fps.min.toFixed(1) : '...'}</div>
          <div><span className="perf-label">최대</span>{fps.max.toFixed(1)}</div>
          <div><span className="perf-label">하위 1%</span><span style={{ color: getFpsColor(fps.p1Low) }}>{fps.p1Low.toFixed(1)}</span></div>
        </div>
        <Sparkline data={fps.history} color={getFpsColor(fps.current)} max={90} warn={60} />
      </div>

      {/* Frame Time */}
      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">브라우저 프레임 간격</h4>
          <span className="perf-current" style={{ color: getFrameTimeColor(frameTime) }}>
            {frameTime.toFixed(2)} ms
          </span>
        </div>
        <BarMeter value={frameTime} max={33.3} color={getFrameTimeColor(frameTime)} label="목표 시간(16.7ms)" />
        <Sparkline data={frameTimeHistory} color={getFrameTimeColor(frameTime)} max={33.3} warn={16.7} />
      </div>

      {/* Draw Calls & GPU */}
      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">GPU 렌더링</h4>
          <span className="perf-current" style={{ color: getDrawCallColor(drawCalls) }}>
            {drawCalls} 회
          </span>
        </div>
        <div className="perf-details-grid">
          <div><span className="perf-label">삼각형</span>{triCount >= 1000000 ? (triCount / 1000000).toFixed(2) + 'M' : triCount >= 1000 ? (triCount / 1000).toFixed(1) + 'K' : triCount}</div>
          <div><span className="perf-label">그리기 호출</span><span style={{ color: getDrawCallColor(drawCalls) }}>{drawCalls}</span></div>
          <div><span className="perf-label">호출당 삼각형</span>{drawCalls > 0 ? Math.round(triCount / drawCalls) : 0}</div>
          <div><span className="perf-label">점</span>{performanceData.render.points}</div>
        </div>
        <Sparkline data={drawCallHistory} color={getDrawCallColor(drawCalls)} max={Math.max(200, ...drawCallHistory)} />
      </div>

      {/* Resources */}
      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">리소스</h4>
        </div>
        <div className="perf-details-grid">
          <div><span className="perf-label">도형</span>{geoCount}</div>
          <div><span className="perf-label">텍스처</span>{texCount}</div>
          <div><span className="perf-label">셰이더 프로그램</span>{performanceData.engine.programs}</div>
          <div><span className="perf-label">선</span>{performanceData.render.lines}</div>
        </div>
        <BarMeter value={geoCount} max={200} color={geoCount > 150 ? '#f87171' : '#4ade80'} label="도형 수 (비교 기준 200개)" />
        <BarMeter value={texCount} max={100} color={texCount > 80 ? '#f87171' : '#4ade80'} label="텍스처 수 (비교 기준 100개)" />
      </div>

      {/* Memory */}
      <div className="perf-stat-group">
        <div className="perf-header">
          <h4 className="perf-title">자바스크립트 메모리</h4>
          {memoryAvailable && (
            <span className="perf-current" style={{ color: getMemoryColor(mem.used, mem.limit) }}>
              {mem.used} MB
            </span>
          )}
        </div>
        {memoryAvailable ? (
          <>
            <div className="perf-details-grid">
              <div><span className="perf-label">한도</span>{mem.limit} MB</div>
              <div><span className="perf-label">사용률</span>{mem.limit > 0 ? ((mem.used / mem.limit) * 100).toFixed(0) : 0}%</div>
            </div>
            <Sparkline data={mem.history} color={getMemoryColor(mem.used, mem.limit)} max={mem.limit || 1} />
          </>
        ) : (
          <p className="perf-label">메모리 측정값이 없습니다. 브라우저 지원 여부에 따라 표시됩니다.</p>
        )}
      </div>
      {children}
    </div>
  );
}
