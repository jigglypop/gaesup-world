import {
  Matrix3,
  PropertyBinding,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
  type AnimationClip,
  type KeyframeTrack,
  type Object3D,
} from 'three';

type PoseProperty = 'quaternion' | 'position' | 'scale';

/** The key `requested` names among `keys`: exact, then ignoring case, then the first key containing it. */
export function findClipKey(keys: readonly string[], requested: string): string | undefined {
  if (keys.includes(requested)) return requested;
  const wanted = requested.toLowerCase();
  return keys.find((key) => key.toLowerCase() === wanted) ?? keys.find((key) => key.toLowerCase().includes(wanted));
}

function findClip(clips: readonly AnimationClip[], requested: string): AnimationClip | undefined {
  const key = findClipKey(clips.map((clip) => clip.name), requested);
  return key === undefined ? undefined : clips.find((clip) => clip.name === key);
}

/** The node and transform a track keys; undefined for other tracks. */
function transformOf(track: KeyframeTrack): { node: string; property: PoseProperty } | undefined {
  const { nodeName, propertyName, propertyIndex } = PropertyBinding.parseTrackName(track.name);
  if (propertyIndex !== undefined || (propertyName !== 'quaternion' && propertyName !== 'position' && propertyName !== 'scale')) return undefined;
  return { node: nodeName, property: propertyName };
}

/** Value size, offset of the value in a key and key size; glTF cubic splines store in-tangent, value, out-tangent. */
function layoutOf(track: KeyframeTrack): { size: number; offset: number; step: number } {
  const step = track.times.length ? track.values.length / track.times.length : track.values.length;
  const factory = (track as unknown as { createInterpolant?: { isInterpolantFactoryMethodGLTFCubicSpline?: boolean } }).createInterpolant;
  return factory?.isInterpolantFactoryMethodGLTFCubicSpline ? { size: step / 3, offset: step / 3, step } : { size: step, offset: 0, step };
}

function firstValue(track: KeyframeTrack): number[] {
  const { size, offset } = layoutOf(track);
  return Array.from(track.values.subarray(offset, offset + size));
}

function nodeOf(root: Object3D, name: string): Object3D | undefined {
  return (PropertyBinding.findNode(root, name) as Object3D | null | undefined) ?? undefined;
}

/** Poses `root` at the first frame of `clip`: each transform `clip` keys takes its first key. */
export function applyClipPose(root: Object3D, clip: AnimationClip): void {
  for (const track of clip.tracks) {
    const transform = transformOf(track);
    const node = transform && nodeOf(root, transform.node);
    if (node) node[transform.property].fromArray(firstValue(track));
  }
  root.updateMatrixWorld(true);
}

/**
 * The mixer returns a bone the playing clip leaves unkeyed to its bind pose, often a T pose, and a crossfade blends
 * toward it. Every clip gets a constant track for each transform another clip keys, held at the first frame of the
 * `pose` clip (default `'idle'`), else of the first clip keying it, else at the node's value in `root`.
 *
 * Tracks are added in place: prepare clips before any action plays them, on copies when other mixers share them.
 */
export function holdUnkeyedTracks(root: Object3D, clips: readonly AnimationClip[], { pose = 'idle' }: { pose?: string } = {}): void {
  if (clips.length < 2) return;
  const posed = findClip(clips, pose);
  const held = new Map<string, number[]>();
  const keyed = new Map<string, { node: string; property: PoseProperty }>();
  for (const clip of posed ? [posed, ...clips] : clips) {
    for (const track of clip.tracks) {
      const transform = transformOf(track);
      if (!transform || held.has(track.name)) continue;
      held.set(track.name, firstValue(track));
      keyed.set(track.name, transform);
    }
  }
  for (const clip of clips) {
    const own = new Set(clip.tracks.map((track) => track.name));
    const end = Math.max(clip.duration, 1e-3);
    for (const [name, { node, property }] of keyed) {
      if (own.has(name)) continue;
      const value = held.get(name) ?? nodeOf(root, node)?.[property].toArray();
      if (!value) continue;
      const Track = property === 'quaternion' ? QuaternionKeyframeTrack : VectorKeyframeTrack;
      clip.tracks.push(new Track(name, [0, end], [...value, ...value]));
    }
  }
}

/** Ground travel per loop, in world units, under which a loop counts as in place and its drift as noise. */
const ROOT_MOTION_FLOOR = 0.1;

/**
 * Walk and run loops often carry root motion: the body strides ahead of its origin and snaps back every cycle, while
 * the world already moves the figure. Removes the per-loop travel of the topmost translated nodes (bob and sway stay)
 * and returns it as a ground speed in world units of `root` per second: the speed at which the feet stay planted at
 * the clip's own rate. A loop travelling under 0.1 units returns 0.
 *
 * The travelling tracks are replaced by copies, so tracks shared with other clips stay as authored.
 */
export function makeClipInPlace(root: Object3D, clip: AnimationClip): number {
  root.updateMatrixWorld(true);
  const moving = clip.tracks.flatMap((track, index) => {
    const transform = transformOf(track);
    const node = transform?.property === 'position' && track.times.length > 1 ? nodeOf(root, transform.node) : undefined;
    return node ? [{ track, index, node }] : [];
  });
  const nodes = new Set(moving.map(({ node }) => node));
  const parentAxes = new Matrix3();
  let speed = 0;
  for (const { track, index, node } of moving) {
    let nested = false;
    for (let parent = node.parent; parent && !nested; parent = parent.parent) nested = nodes.has(parent);
    const { size, offset, step } = layoutOf(track);
    const times = track.times;
    const last = (times.length - 1) * step + offset;
    const span = times[times.length - 1]! - times[0]!;
    if (nested || size !== 3 || !(span > 0)) continue;
    const drift = new Vector3(track.values[last]! - track.values[offset]!, track.values[last + 1]! - track.values[offset + 1]!, track.values[last + 2]! - track.values[offset + 2]!);
    const copy = track.clone();
    const slope = drift.clone().divideScalar(span);
    for (let key = 0; key < times.length; key++) {
      const elapsed = times[key]! - times[0]!;
      for (let axis = 0; axis < 3; axis++) {
        copy.values[key * step + offset + axis]! -= slope.getComponent(axis) * elapsed;
        // Cubic-spline tangents are per-second derivatives; the removed travel is a constant slope.
        if (offset) {
          copy.values[key * step + axis]! -= slope.getComponent(axis);
          copy.values[key * step + 2 * size + axis]! -= slope.getComponent(axis);
        }
      }
    }
    clip.tracks[index] = copy;
    if (node.parent) drift.applyMatrix3(parentAxes.setFromMatrix4(node.parent.matrixWorld));
    const travel = Math.hypot(drift.x, drift.z);
    if (travel >= ROOT_MOTION_FLOOR) speed = Math.max(speed, travel / Math.max(clip.duration, span));
  }
  return speed;
}
