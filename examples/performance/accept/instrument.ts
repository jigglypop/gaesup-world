import { readRendererStats, type RendererInfoSource } from 'gaesup-world';

/** `compiles` counts render calls that created shader programs: compilation on the frame path, not ahead of it. */
export type RendererFrame = { renders: number; drawCalls: number; triangles: number; compiles: number };
type ProgramInfo = RendererInfoSource & { createProgram?: (...args: never[]) => unknown };
type TrackedRenderer = { info: ProgramInfo; render: (...args: never[]) => unknown };

let active: RendererTracker | null = null;

/**
 * Counts render calls and created programs, and keeps the latest frame's draw calls and triangles. Frame totals come
 * from the renderer's own counters (WebGPU accumulates per frame; WebGL reports the last render). Programs are counted
 * where the common renderer creates them, since the live count also drops when unused programs are released.
 */
export function trackRenderer(renderer: TrackedRenderer) {
  const frame: RendererFrame = { renders: 0, drawCalls: 0, triangles: 0, compiles: 0 };
  const { info } = renderer;
  let created = 0;
  const createProgram = info.createProgram;
  if (createProgram) info.createProgram = function (this: unknown, ...args: never[]) { created++; return createProgram.apply(this, args); };
  const render = renderer.render;
  renderer.render = function (this: unknown, ...args: never[]) {
    const before = created;
    const result = render.apply(this, args);
    const stats = readRendererStats(info);
    frame.renders++; frame.drawCalls = stats.drawCalls; frame.triangles = stats.triangles;
    if (created > before) frame.compiles++;
    return result;
  };
  const tracker = {
    frame: frame as Readonly<RendererFrame>,
    stats: () => readRendererStats(info),
    /** Programs created since tracking began (WebGPU and its WebGL2 backend). */
    programsCreated: () => created,
    dispose: () => {
      renderer.render = render;
      if (createProgram) info.createProgram = createProgram;
      if (active === tracker) active = null;
    },
  };
  active = tracker;
  return tracker;
}
export type RendererTracker = ReturnType<typeof trackRenderer>;

/** The renderer the running scenario tracks; the HUD reads it. */
export function activeRenderer(): RendererTracker | null {
  return active;
}
