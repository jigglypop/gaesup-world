import { useEffect, useRef } from 'react';

// 리렌더링 추적 시스템
export class RenderMonitor {
  private static instance: RenderMonitor;
  private renderCounts: Map<string, number> = new Map();
  private lastRenderTimes: Map<string, number> = new Map();
  private renderReasons: Map<string, string[]> = new Map();
  private isLogging = false; // Temporarily disabled

  static getInstance() {
    if (!RenderMonitor.instance) {
      RenderMonitor.instance = new RenderMonitor();
    }
    return RenderMonitor.instance;
  }

  trackRender(componentName: string, reason: string, data?: any) {
    if (!this.isLogging) return;

    const now = performance.now();
    const count = (this.renderCounts.get(componentName) || 0) + 1;
    const lastTime = this.lastRenderTimes.get(componentName) || now;
    const timeDiff = now - lastTime;

    this.renderCounts.set(componentName, count);
    this.lastRenderTimes.set(componentName, now);

    if (!this.renderReasons.has(componentName)) {
      this.renderReasons.set(componentName, []);
    }
    this.renderReasons.get(componentName)!.push(`${reason} (+${timeDiff.toFixed(2)}ms)`);

    // 경고 레벨별 로깅
    if (timeDiff < 16) {
      // 60fps 미만
      console.warn(`🔥 HIGH FREQUENCY RENDER: ${componentName} - ${reason}`, {
        count,
        timeDiff: `${timeDiff.toFixed(2)}ms`,
        data,
      });
    } else if (count > 100) {
      console.error(`💥 EXCESSIVE RENDERS: ${componentName} - ${count} renders`, {
        reasons: this.renderReasons.get(componentName)?.slice(-5),
      });
    }
  }

  getStats() {
    const stats = {
      totalComponents: this.renderCounts.size,
      totalRenders: Array.from(this.renderCounts.values()).reduce((a, b) => a + b, 0),
      components: Array.from(this.renderCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          lastReasons: this.renderReasons.get(name)?.slice(-3) || [],
        }))
        .sort((a, b) => b.count - a.count),
    };

    console.table(stats.components);
    return stats;
  }

  reset() {
    this.renderCounts.clear();
    this.lastRenderTimes.clear();
    this.renderReasons.clear();
    console.log('🔄 Render monitor reset');
  }

  setLogging(enabled: boolean) {
    this.isLogging = enabled;
    console.log(`📊 Render logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// React Hook for component render tracking
export function useRenderTracker(componentName: string) {
  const monitor = RenderMonitor.getInstance();
  const renderCount = useRef(0);
  const lastProps = useRef<any>({});

  useEffect(() => {
    renderCount.current++;
    monitor.trackRender(componentName, `useEffect-${renderCount.current}`);
  });

  return {
    trackRender: (reason: string, data?: any) => {
      monitor.trackRender(componentName, reason, data);
    },
    trackPropsChange: (props: any) => {
      const changes = Object.keys(props).filter((key) => props[key] !== lastProps.current[key]);
      if (changes.length > 0) {
        monitor.trackRender(componentName, `props-change: ${changes.join(', ')}`, { changes });
      }
      lastProps.current = { ...props };
    },
  };
}

// 성능 측정 데코레이터
export function measurePerformance(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();

    if (end - start > 1) {
      // 1ms 이상 걸리는 함수만 로깅
      console.log(`⏱️ ${target.constructor.name}.${propertyName}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  };

  return descriptor;
}

// Global render monitor instance
export const renderMonitor = RenderMonitor.getInstance();
