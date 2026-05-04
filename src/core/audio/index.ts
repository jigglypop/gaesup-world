export type { SfxId, SfxDef, BgmId, BgmTrack, AudioSerialized } from './types';
export { getAudioEngine } from './core/AudioEngine';
export type { AudioEngine } from './core/AudioEngine';
export { useAudioStore } from './stores/audioStore';
export {
  audioPlugin,
  createAudioPlugin,
  hydrateAudioState,
  serializeAudioState,
} from './plugin';
export type { AudioPluginOptions } from './plugin';
export { useAmbientBgm } from './hooks/useAmbientBgm';
export { AudioControls } from './components/AudioControls';
export type { AudioControlsProps } from './components/AudioControls';
export { Footsteps } from './components/Footsteps';
export type { FootstepsProps, SurfaceTag } from './components/Footsteps';
