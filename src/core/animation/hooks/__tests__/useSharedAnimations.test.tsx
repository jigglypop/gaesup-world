import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { AnimationClip, AnimationMixer, NumberKeyframeTrack, Object3D } from 'three';

import { FrameSchedulerHost, useCanvasFrameScheduler, type FrameScheduler } from '../../../runtime/frame';
import { useSharedAnimations } from '../useSharedAnimations';

const clip = new AnimationClip('wave', 1, [new NumberKeyframeTrack('.position[x]', [0, 1], [0, 1])]);
const mixers: AnimationMixer[] = [];
let scheduler: FrameScheduler | null = null;
let readSubscribers: () => number = () => 0;

function Animated() {
  const [root] = [new Object3D()];
  const { actions, mixer } = useSharedAnimations([clip], root);
  mixers.push(mixer);
  actions['wave']?.play();
  return null;
}

function Capture() {
  scheduler = useCanvasFrameScheduler();
  const get = useThree((state) => state.get);
  readSubscribers = () => get().internal.subscribers.length;
  return null;
}

test('all mixers advance from one animation-phase entry, not one R3F subscriber each', async () => {
  const tree = (count: number) => (
    <>
      <FrameSchedulerHost />
      <Capture />
      {Array.from({ length: count }, (_, index) => <Animated key={index} />)}
    </>
  );
  const renderer = await ReactThreeTestRenderer.create(tree(1));
  try {
    const single = readSubscribers();
    await renderer.update(tree(5));
    expect(readSubscribers()).toBe(single);
    expect(scheduler!.count('animation')).toBe(1);
    await renderer.advanceFrames(1, 0.25);
    expect(new Set(mixers.slice(-5).map((mixer) => mixer.time))).toEqual(new Set([0.25]));
    await renderer.update(tree(0));
    expect(scheduler!.count('animation')).toBe(0);
  } finally {
    await renderer.unmount();
  }
});
