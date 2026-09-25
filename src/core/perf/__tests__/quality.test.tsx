import { act, useEffect } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DirectionalLight } from 'three';

import { DynamicSky } from '../../rendering/sky';
import * as detect from '../detect';
import { MAX_QUALITY_PIXEL_RATIO, QualityProfileProvider, resolveQualityDpr, useQualityProfile } from '../quality';
import { usePerfStore } from '../stores/perfStore';

jest.mock('../../rendering/sky/shadowFollow', () => ({ shadowFocus: jest.fn(), placeShadowLight: jest.fn() }));

let dpr = 0;
let tier: string | undefined;
let setDpr: ((dpr: number) => void) | undefined;
function Probe() {
  dpr = useThree((state) => state.viewport.dpr);
  setDpr = useThree((state) => state.setDpr);
  tier = useQualityProfile()?.tier;
  return null;
}

let mounts = 0;
function MountCounter() {
  useEffect(() => {
    mounts += 1;
  }, []);
  return null;
}

beforeEach(() => {
  Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true });
  usePerfStore.setState({ profile: detect.profileForTier('medium'), capabilities: null, manualOverride: false });
  mounts = 0;
});

afterEach(() => jest.restoreAllMocks());

test('a quality tier caps the canvas pixel ratio and sizes sky shadows', async () => {
  const renderer = await ReactThreeTestRenderer.create(
    <QualityProfileProvider quality="high"><Probe /><DynamicSky /></QualityProfileProvider>,
  );
  try {
    expect(tier).toBe('high');
    expect(dpr).toBe(MAX_QUALITY_PIXEL_RATIO);
    const sun = renderer.scene.findAll((node) => node.instance instanceof DirectionalLight)[0]!.instance as DirectionalLight;
    expect(sun.shadow.mapSize.x).toBe(2048);
    await renderer.update(<QualityProfileProvider quality="low"><Probe /><DynamicSky /></QualityProfileProvider>);
    expect(dpr).toBe(1);
    expect(sun.shadow.mapSize.x).toBe(512);
  } finally {
    await renderer.unmount();
  }
});

test('the pixel ratio returns to the profile after the canvas resets it', async () => {
  const renderer = await ReactThreeTestRenderer.create(<QualityProfileProvider quality="medium"><Probe /></QualityProfileProvider>);
  try {
    expect(dpr).toBe(1.5);
    // A Canvas re-render reapplies its default dpr of [1, 2].
    await act(async () => setDpr!(2));
    expect(dpr).toBe(1.5);
  } finally {
    await renderer.unmount();
  }
});

test('auto detects the device once, before children render, from the existing renderer', async () => {
  const lowEnd = { profile: detect.profileForTier('low'), capabilities: { ...detect.detectCapabilities({ webgl2: true, maxTextureSize: 4096, rendererName: 'Intel UHD', vendorName: 'Intel' }), cores: 4, memory: 4 } };
  const spy = jest.spyOn(detect, 'autoDetectProfile').mockReturnValue(lowEnd);
  const seen: Array<string | undefined> = [];
  function FirstRender() {
    seen.push(useQualityProfile()?.tier);
    return null;
  }
  const renderer = await ReactThreeTestRenderer.create(<QualityProfileProvider quality="auto"><FirstRender /><Probe /></QualityProfileProvider>);
  try {
    expect(seen[0]).toBe('low');
    expect(dpr).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(usePerfStore.getState().capabilities).toBe(lowEnd.capabilities);
    // Later worlds reuse the stored result instead of detecting again.
    expect(resolveQualityDpr('auto')).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
  } finally {
    await renderer.unmount();
  }
});

test('turning quality on and off keeps the subtree mounted', async () => {
  const renderer = await ReactThreeTestRenderer.create(<QualityProfileProvider><MountCounter /><Probe /></QualityProfileProvider>);
  try {
    expect(tier).toBeUndefined();
    await renderer.update(<QualityProfileProvider quality="low"><MountCounter /><Probe /></QualityProfileProvider>);
    expect(tier).toBe('low');
    await renderer.update(<QualityProfileProvider><MountCounter /><Probe /></QualityProfileProvider>);
    expect(tier).toBeUndefined();
    expect(mounts).toBe(1);
  } finally {
    await renderer.unmount();
  }
});

test('resolveQualityDpr gives the canvas the profile ratio up front', () => {
  expect(resolveQualityDpr('high')).toBe(MAX_QUALITY_PIXEL_RATIO);
  expect(resolveQualityDpr('low')).toBe(1);
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
  expect(resolveQualityDpr('high')).toBe(1);
});
