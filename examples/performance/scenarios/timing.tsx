import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { useGameClock, useTimeStore } from 'gaesup-world';

import type { Scenario, ScenarioContext } from './types';

/** Drive the real public hook with controlled display timestamps, independent of monitor refresh. */
async function tickDeterminism(ctx: ScenarioContext) {
  const request = window.requestAnimationFrame;
  const cancel = window.cancelAnimationFrame;
  const saved = useTimeStore.getState();
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 0;
  window.requestAnimationFrame = callback => { pending.set(++nextId, callback); return nextId; };
  window.cancelAnimationFrame = id => { pending.delete(id); };
  function Consumer() { useGameClock(); return null; }
  const results: string[] = [];
  try {
    for (const rate of [30, 60, 144]) for (const consumers of [1, 2]) {
      let elapsed = 0;
      let notifications = 0;
      useTimeStore.setState({ ...saved, mode: 'scaled', scale: 1, paused: false,
        tick: ms => { elapsed += ms; saved.tick(ms); } }, true);
      const off = useTimeStore.subscribe((state, previous) => {
        if (state.totalMinutes !== previous.totalMinutes) notifications++;
      });
      const root = createRoot(ctx.host);
      let owners = 0;
      try {
        flushSync(() => root.render(<>{Array.from({ length: consumers }, (_, index) => <Consumer key={index} />)}</>));
        owners = pending.size;
        for (let frame = 0; frame <= rate; frame++) {
          const callbacks = [...pending.values()]; pending.clear();
          for (const callback of callbacks) callback(1000 + frame * 1000 / rate);
        }
      } finally { flushSync(() => root.unmount()); off(); }
      const label = `${rate}Hz/${consumers}-consumers`;
      ctx.assert(`${label}/clock-owners`, 1, owners);
      ctx.assert(`${label}/elapsed-ms`, 1000, Math.round(elapsed));
      ctx.assert(`${label}/notifications`, 60, notifications);
      ctx.assert(`${label}/pending-after-unmount`, 0, pending.size);
      ctx.sample(`clock-owners/${label}`, owners, 'count', 'controlled-display-timestamps');
      ctx.sample(`notifications/${label}`, notifications, 'count', 'one-second-time-store');
      ctx.sample(`elapsed/${label}`, elapsed, 'ms', 'one-second-time-store');
      results.push(`${label}: owner ${owners}, 시간 ${Math.round(elapsed)}ms, 알림 ${notifications}`);
    }
    ctx.host.textContent = results.join('\n');
  } finally {
    window.requestAnimationFrame = request; window.cancelAnimationFrame = cancel;
    useTimeStore.setState(saved, true);
  }
}

export const timingScenarios: Scenario[] = [
  { id: 'tick-determinism', title: '고정 tick·중복 clock', description: '실제 useGameClock을 30/60/144Hz 표시와 1·2개 소비자로 구동해 1초당 tick·알림을 비교합니다.', version: 1, run: tickDeterminism },
];
