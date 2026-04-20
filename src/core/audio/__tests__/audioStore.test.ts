import { useAudioStore } from '../stores/audioStore';

beforeEach(() => {
  useAudioStore.setState({
    masterMuted: false,
    bgmMuted: false,
    sfxMuted: false,
    masterVolume: 0.6,
    bgmVolume: 0.4,
    sfxVolume: 0.7,
    currentBgmId: null,
  });
});

describe('audioStore', () => {
  test('volume setters clamp to [0, 1]', () => {
    useAudioStore.getState().setMaster(2);
    expect(useAudioStore.getState().masterVolume).toBe(1);
    useAudioStore.getState().setMaster(-1);
    expect(useAudioStore.getState().masterVolume).toBe(0);
  });

  test('toggle mute flags', () => {
    expect(useAudioStore.getState().masterMuted).toBe(false);
    useAudioStore.getState().toggleMaster();
    expect(useAudioStore.getState().masterMuted).toBe(true);
    useAudioStore.getState().toggleBgm();
    expect(useAudioStore.getState().bgmMuted).toBe(true);
    useAudioStore.getState().toggleSfx();
    expect(useAudioStore.getState().sfxMuted).toBe(true);
  });

  test('serialize / hydrate round trip', () => {
    useAudioStore.getState().setBgm(0.25);
    useAudioStore.getState().toggleSfx();
    const data = useAudioStore.getState().serialize();
    useAudioStore.setState({
      masterMuted: false, bgmMuted: false, sfxMuted: false,
      masterVolume: 0.6, bgmVolume: 0.4, sfxVolume: 0.7, currentBgmId: null,
    });
    useAudioStore.getState().hydrate(data);
    const s = useAudioStore.getState();
    expect(s.bgmVolume).toBeCloseTo(0.25, 5);
    expect(s.sfxMuted).toBe(true);
  });

  test('playSfx silently no-ops in jsdom (no AudioContext)', () => {
    expect(() => useAudioStore.getState().playSfx({ id: 'test', freq: 440, duration: 0.1 })).not.toThrow();
  });
});
