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

const culled = new Map<Object3D, AnimationMixer>();

function Culled({ root }: { root: Object3D }) {
  const { actions, mixer } = useSharedAnimations([clip], root, 1);
  culled.set(root, mixer);
  actions['wave']?.play();
  return null;
}

function ViewFromDefaultCamera() {
  useThree((state) => state.camera).updateMatrixWorld();
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

test('a mixer with a cull radius holds still off screen and catches up when its root comes back into view', async () => {
  const seen = new Object3D();
  const hidden = new Object3D();
  hidden.position.set(0, 0, 50); // behind the default camera at z = 5
  const renderer = await ReactThreeTestRenderer.create(
    <>
      <FrameSchedulerHost />
      <ViewFromDefaultCamera />
      <Culled root={seen} />
      <Culled root={hidden} />
    </>,
  );
  try {
    await renderer.advanceFrames(1, 0.25);
    expect([culled.get(seen)!.time, culled.get(hidden)!.time]).toEqual([0.25, 0]);
    hidden.position.set(0, 0, 0);
    await renderer.advanceFrames(1, 0.25);
    expect([culled.get(seen)!.time, culled.get(hidden)!.time]).toEqual([0.5, 0.5]);
  } finally {
    await renderer.unmount();
  }
});

test('engine clip names find the spellings exported models use, without hiding a clip of that name', async () => {
  const named = (name: string) => new AnimationClip(name, 1, [new NumberKeyframeTrack('.position[x]', [0, 1], [0, 1])]);
  let found: Record<string, string | undefined> = {};
  let listed: string[] = [];
  function Probe() {
    const { actions } = useSharedAnimations([named('Idle'), named('Walking'), named('Running'), named('run')], new Object3D());
    found = Object.fromEntries(['idle', 'walk', 'run'].map((name) => [name, actions[name]?.getClip().name]));
    listed = Object.keys({ ...actions });
    return null;
  }
  const renderer = await ReactThreeTestRenderer.create(<><FrameSchedulerHost /><Probe /></>);
  expect(found).toEqual({ idle: 'Idle', walk: 'Walking', run: 'run' });
  // The player's animation bridge registers a spread copy, so the aliases must survive it.
  expect(listed).toEqual(['Idle', 'Walking', 'Running', 'run', 'idle', 'walk']);
  await renderer.unmount();
});
