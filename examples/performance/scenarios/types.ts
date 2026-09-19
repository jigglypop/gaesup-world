import type { Assertion, LabConfig, Metric, RunEnvironment } from '../model';

export class UnsupportedScenario extends Error {}

export type ScenarioContext = {
  host: HTMLElement;
  config: LabConfig;
  signal: AbortSignal;
  assert: (id: string, expected: Assertion['expected'], actual: Assertion['actual']) => void;
  sample: (name: string, value: number, unit: Metric['unit'], scope: string) => void;
  unavailable: (name: string, unit: Metric['unit'], scope: string, reason: string) => void;
  environment: (update: Partial<RunEnvironment>) => void;
  progress: (text: string) => void;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  version: number;
  requirementIds: string[];
  timed?: boolean;
  run: (context: ScenarioContext) => Promise<void>;
};

export function checkAbort(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('실행 중지', 'AbortError');
}

export async function nextFrame(signal: AbortSignal): Promise<number> {
  checkAbort(signal);
  return new Promise((resolve, reject) => {
    const abort = () => { cancelAnimationFrame(frame); reject(new DOMException('실행 중지', 'AbortError')); };
    const frame = requestAnimationFrame((time) => { signal.removeEventListener('abort', abort); resolve(time); });
    signal.addEventListener('abort', abort, { once: true });
  });
}
