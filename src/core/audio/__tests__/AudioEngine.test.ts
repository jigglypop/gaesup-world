import { createAudioEngine, getAudioEngine } from '../core/AudioEngine';

const parameter = () => ({ value: 1, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() });
const gain = () => ({ gain: parameter(), connect: jest.fn(), disconnect: jest.fn() });
const source = () => ({
  frequency: parameter(), connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn(),
  onended: null as (() => void) | null,
});

describe('AudioEngine source and request ownership', () => {
  const engine = getAudioEngine();
  const previousContext = window.AudioContext;
  const previousFetch = globalThis.fetch;
  let nodes: ReturnType<typeof source>[];
  let context: {
    state: string; currentTime: number; destination: object;
    createGain: jest.Mock; createBufferSource: jest.Mock; createOscillator: jest.Mock;
    decodeAudioData: jest.Mock; close: jest.Mock; resume: jest.Mock;
  };
  const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  beforeEach(() => {
    nodes = [];
    const createSource = jest.fn(() => { const node = source(); nodes.push(node); return node; });
    context = { state: 'running', currentTime: 0, destination: {}, createGain: jest.fn(gain),
      createBufferSource: createSource, createOscillator: createSource,
      decodeAudioData: jest.fn(async () => ({})), resume: jest.fn(async () => {}),
      close: jest.fn(async () => { context.state = 'closed'; }),
    };
    window.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    globalThis.fetch = jest.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })) as unknown as typeof fetch;
  });
  afterEach(async () => {
    await engine.dispose();
    window.AudioContext = previousContext;
    globalThis.fetch = previousFetch;
  });

  it('stops and disconnects URL BGM without stopping active SFX', async () => {
    engine.playSfx({ id: 'effect', freq: 440 });
    engine.playBgm({ id: 'track', url: '/track.wav' });
    await settle();
    const [sfx, bgm] = nodes;
    expect(bgm!.start).toHaveBeenCalledTimes(1);
    engine.stopBgm();
    expect(bgm!.stop).toHaveBeenCalledTimes(1);
    expect(bgm!.disconnect).toHaveBeenCalledTimes(1);
    expect(sfx!.disconnect).not.toHaveBeenCalled();
    sfx!.onended!();
    expect(sfx!.disconnect).toHaveBeenCalledTimes(1);
    expect(engine.getCurrentBgmId()).toBeNull();
  });

  it.each(['stop', 'switch', 'dispose'] as const)('prevents a late decoded BGM from starting after %s', async operation => {
    let finish!: (buffer: object) => void;
    context.decodeAudioData.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    engine.playBgm({ id: 'old', url: '/old.wav' });
    await settle();
    expect(finish).toBeDefined();
    if (operation === 'stop') engine.stopBgm();
    else if (operation === 'switch') engine.playBgm({ id: 'new', url: '/new.wav' });
    else await engine.dispose();
    finish({});
    await settle();
    expect(nodes).toHaveLength(operation === 'switch' ? 1 : 0);
    expect(engine.getCurrentBgmId()).toBe(operation === 'switch' ? 'new' : null);
  });

  it('stops synthesized notes immediately and releases the context on disposal', async () => {
    engine.playBgm({ id: 'synth', intervalMs: 10000 });
    const note = nodes[0]!;
    expect(note.stop).toHaveBeenCalledTimes(1); // Scheduled natural end.
    engine.stopBgm();
    expect(note.stop).toHaveBeenCalledTimes(2); // Immediate cancellation.
    expect(note.disconnect).toHaveBeenCalledTimes(1);
    await engine.dispose();
    expect(context.close).toHaveBeenCalledTimes(1);
    await engine.dispose();
    expect(context.close).toHaveBeenCalledTimes(1);
  });

  it('aborts pending SFX fetches on disposal and can create a new context afterwards', async () => {
    let finish!: (response: { ok: boolean; arrayBuffer: () => Promise<ArrayBuffer> }) => void;
    const fetchMock = jest.fn<Promise<unknown>, [url: string, options: RequestInit]>(
      () => new Promise(resolve => { finish = resolve; }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    engine.playSfx({ id: 'pending', url: '/pending.wav' });
    const signal = fetchMock.mock.calls[0]![1].signal!;
    await engine.dispose();
    expect(signal.aborted).toBe(true);
    finish({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await settle();
    expect(nodes).toHaveLength(0);
    expect(engine.ensure()).toBe(true);
    expect(window.AudioContext).toHaveBeenCalledTimes(2);
  });

  it('cancels active and decoding gameplay sounds while preserving the current music', async () => {
    engine.playBgm({ id: 'music', intervalMs: 10000 });
    engine.playSfx({ id: 'active' });
    let finish!: (buffer: object) => void;
    context.decodeAudioData.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    engine.playSfx({ id: 'pending', url: '/effect.wav' }); await settle();
    engine.cancelSfx(); finish({}); await settle();
    expect(nodes).toHaveLength(2); expect(nodes[0]!.disconnect).not.toHaveBeenCalled();
    expect(nodes[1]!.disconnect).toHaveBeenCalledTimes(1); expect(engine.getCurrentBgmId()).toBe('music');
  });

  it('a world playback guard rejects SFX and BGM replacement without destroying current music', async () => {
    let allowed = true; const guarded = createAudioEngine({ canPlay: () => allowed });
    try {
      guarded.playBgm({ id: 'manual', intervalMs: 10000 }); allowed = false;
      guarded.playBgm({ id: 'reentrant' }); guarded.playSfx({ id: 'reentrant' });
      expect(nodes).toHaveLength(1); expect(guarded.getCurrentBgmId()).toBe('manual');
      allowed = true; guarded.playSfx({ id: 'fresh' }); expect(nodes).toHaveLength(2);
    } finally { await guarded.dispose(); }
  });
});
