import { readRendererStats, type RendererInfoSource } from '../rendererStats';

const webgl: RendererInfoSource = {
  autoReset: true,
  render: { calls: 4, triangles: 120, points: 2, lines: 6 },
  memory: { geometries: 3, textures: 2 },
  programs: [{}, {}],
};

describe('renderer counter semantics', () => {
  it('preserves WebGL draw calls and reports unsupported information as null', () => {
    expect(readRendererStats(webgl)).toEqual({
      counterModel: 'webgl', counterScope: 'last-render', drawCalls: 4,
      renderInvocations: null, triangles: 120, points: 2, lines: 6,
      geometries: 3, textures: 2, programs: 2, allocatedBytesEstimate: null,
    });
  });

  it('does not confuse cumulative render invocations with common renderer draw calls', () => {
    const info = {
      ...webgl,
      render: { ...webgl.render, calls: 91, frameCalls: 17, drawCalls: 40 },
      memory: { ...webgl.memory, programs: 8, total: 4096 },
    };
    expect(readRendererStats(info)).toMatchObject({
      counterModel: 'common', counterScope: 'renderer-frame', drawCalls: 40,
      renderInvocations: 17, programs: 8, allocatedBytesEstimate: 4096,
    });
    expect(info.render.calls).toBe(91);
  });

  it('labels explicitly accumulated passes and zero draws correctly', () => {
    const info = { ...webgl, autoReset: false, render: { ...webgl.render, drawCalls: 0 } };
    expect(readRendererStats(info)).toMatchObject({
      counterScope: 'since-reset', drawCalls: 0, renderInvocations: null,
    });
  });
});
