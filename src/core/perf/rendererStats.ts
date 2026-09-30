/** Structural interface shared by WebGLRenderer and the common renderer backends. */
export type RendererInfoSource = {
  autoReset?: boolean;
  render: {
    calls: number;
    drawCalls?: number;
    frameCalls?: number;
    triangles: number;
    points: number;
    lines: number;
  };
  memory: {
    geometries: number;
    textures: number;
    programs?: number;
    total?: number;
  };
  programs?: readonly unknown[] | null;
};

export type RendererCounterScope = 'renderer-frame' | 'last-render' | 'since-reset';

export type RendererStats = {
  counterModel: 'common' | 'webgl';
  counterScope: RendererCounterScope;
  drawCalls: number;
  renderInvocations: number | null;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  programs: number;
  /** Renderer-accounted allocations; not device VRAM usage. */
  allocatedBytesEstimate: number | null;
};

/** Does not reset counters or take ownership of the renderer's frame loop. */
export function readRendererStats(info: RendererInfoSource): RendererStats {
  // WebGPURenderer also uses common Info when its backend falls back to WebGL.
  const common = typeof info.render.drawCalls === 'number';
  return {
    counterModel: common ? 'common' : 'webgl',
    counterScope: info.autoReset === false ? 'since-reset' : common ? 'renderer-frame' : 'last-render',
    drawCalls: common ? info.render.drawCalls! : info.render.calls,
    renderInvocations: common ? info.render.frameCalls ?? null : null,
    triangles: info.render.triangles,
    points: info.render.points,
    lines: info.render.lines,
    geometries: info.memory.geometries,
    textures: info.memory.textures,
    programs: common ? info.memory.programs ?? 0 : info.programs?.length ?? 0,
    allocatedBytesEstimate: typeof info.memory.total === 'number' ? info.memory.total : null,
  };
}
