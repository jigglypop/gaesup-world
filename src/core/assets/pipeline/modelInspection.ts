import * as THREE from 'three';

import type {
  AssetImportIssue,
  AssetImportLimits,
  AssetModelStats,
  FigureClipReport,
  FigureReport,
} from './types';

export const DEFAULT_ASSET_IMPORT_LIMITS: AssetImportLimits = {
  maxTriangles: 50_000,
  maxMaterials: 16,
  maxTextureSize: 2048,
  maxBones: 128,
  maxBoundingSize: 50,
};

/** Budgets for a figure a scene draws a dozen of, each once more for shadows. */
export const DEFAULT_FIGURE_LIMITS: AssetImportLimits = {
  ...DEFAULT_ASSET_IMPORT_LIMITS,
  maxTriangles: 25_000,
  maxBytes: 4_000_000,
};

const MIN_REASONABLE_SIZE = 0.01;
const TEXTURE_KEYS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap'] as const;

function imageSize(texture: THREE.Texture): [number, number] {
  const image = texture.image as { width?: number; height?: number } | undefined;
  return [image?.width ?? 0, image?.height ?? 0];
}

export function inspectModel(root: THREE.Object3D, animations: readonly THREE.AnimationClip[] = []): AssetModelStats {
  let meshes = 0;
  let triangles = 0;
  let bones = 0;
  let maxTextureSize = 0;
  let textureBytes = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (object instanceof THREE.Bone) bones++;
    if (!(object instanceof THREE.Mesh)) return;
    meshes++;
    const geometry = object.geometry as THREE.BufferGeometry;
    const indexCount = geometry.index?.count ?? geometry.getAttribute('position')?.count ?? 0;
    triangles += Math.floor(indexCount / 3);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      if (!material) continue;
      materials.add(material);
      const record = material as unknown as Record<string, unknown>;
      for (const key of TEXTURE_KEYS) {
        const texture = record[key];
        if (texture instanceof THREE.Texture && !textures.has(texture)) {
          textures.add(texture);
          const [width, height] = imageSize(texture);
          maxTextureSize = Math.max(maxTextureSize, width, height);
          textureBytes += (width * height * 16) / 3;
        }
      }
    }
  });

  // Skinned bounds follow the bones, which a fresh load has not placed yet.
  root.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  return {
    meshes,
    triangles,
    materials: materials.size,
    textures: textures.size,
    maxTextureSize,
    bones,
    animationClips: animations.map((clip) => clip.name),
    boundingSize: [size.x, size.y, size.z],
    textureBytes,
  };
}

export function validateModelStats(
  stats: AssetModelStats,
  limits: AssetImportLimits = DEFAULT_ASSET_IMPORT_LIMITS,
): AssetImportIssue[] {
  const issues: AssetImportIssue[] = [];
  if (stats.meshes === 0) {
    issues.push({ code: 'empty-model', severity: 'error', message: '메시가 없는 모델입니다' });
  }
  if (stats.triangles > limits.maxTriangles) {
    issues.push({
      code: 'too-many-triangles',
      severity: stats.triangles > limits.maxTriangles * 2 ? 'error' : 'warning',
      message: `삼각형 ${stats.triangles}개가 한도 ${limits.maxTriangles}를 넘습니다`,
    });
  }
  if (stats.materials > limits.maxMaterials) {
    issues.push({ code: 'too-many-materials', severity: 'warning', message: `머티리얼 ${stats.materials}개가 한도 ${limits.maxMaterials}를 넘습니다` });
  }
  if (stats.maxTextureSize > limits.maxTextureSize) {
    issues.push({ code: 'texture-too-large', severity: 'warning', message: `텍스처 ${stats.maxTextureSize}px가 한도 ${limits.maxTextureSize}px를 넘습니다` });
  }
  if (stats.bones > limits.maxBones) {
    issues.push({ code: 'too-many-bones', severity: 'error', message: `본 ${stats.bones}개가 한도 ${limits.maxBones}를 넘습니다` });
  }
  if (stats.bytes !== undefined && limits.maxBytes !== undefined && stats.bytes > limits.maxBytes) {
    const megabytes = (bytes: number) => (bytes / 1e6).toFixed(1);
    issues.push({ code: 'file-too-large', severity: 'warning', message: `파일 ${megabytes(stats.bytes)}MB가 한도 ${megabytes(limits.maxBytes)}MB를 넘습니다` });
  }
  const largest = Math.max(...stats.boundingSize);
  if (stats.meshes > 0 && (largest > limits.maxBoundingSize || largest < MIN_REASONABLE_SIZE)) {
    issues.push({ code: 'unexpected-scale', severity: 'warning', message: `모델 크기 ${largest.toFixed(3)}m가 일반적인 범위를 벗어났습니다` });
  }
  return issues;
}

/** Mixamo names of the bones every humanoid figure needs. */
export const HUMANOID_CORE_BONES = [
  'Hips', 'Spine', 'Neck', 'Head',
  'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot',
] as const;

const UNITY_HUMANOID_NAMES: Readonly<Record<string, string>> = {
  LeftUpperArm: 'LeftArm', LeftLowerArm: 'LeftForeArm', RightUpperArm: 'RightArm', RightLowerArm: 'RightForeArm',
  LeftUpperLeg: 'LeftUpLeg', LeftLowerLeg: 'LeftLeg', RightUpperLeg: 'RightUpLeg', RightLowerLeg: 'RightLeg',
};

/**
 * A bone's Mixamo name. Rig prefixes (`mixamorig:`, `mixamorig1:`, `mixamorig_` and three's sanitized `mixamorig`)
 * are dropped, and Unity/VRM humanoid names (`leftUpperArm`) map to Mixamo ones.
 */
export function humanoidBoneName(name: string): string {
  const bare = name.replace(/^mixamorig\d*[:_]?/i, '');
  const pascal = bare.charAt(0).toUpperCase() + bare.slice(1);
  return UNITY_HUMANOID_NAMES[pascal] ?? pascal;
}

/** Engine clip names by the spellings figure sources ship with (Mixamo, Tripo presets, lower-cased). */
const FIGURE_CLIP_NAMES: Readonly<Record<string, string>> = {
  idle: 'idle', walk: 'walk', walking: 'walk', run: 'run', running: 'run',
  jump: 'jump', jumping: 'jump', fall: 'fall', falling: 'fall',
  wave: 'wave', wave_one_hand: 'wave', wave_goodbye: 'wave', wave_goodbye_01: 'wave', big_wave_hello: 'wave',
  look: 'look', look_around: 'look',
};

/** The engine's name for a clip (`Walking` → `walk`, `preset:biped:look_around` → `look`), if it has one. */
export function figureClipName(name: string): string | undefined {
  const last = name.split(/[|:]/).pop() ?? name;
  return FIGURE_CLIP_NAMES[last.trim().toLowerCase().replace(/[\s.-]+/g, '_')];
}

/** Clips shorter than this that only hold the rest pose are stubs. */
export const REST_POSE_STUB_SECONDS = 0.1;

/**
 * Whether a clip is a rest-pose stub (Blender's `restpose`, `Walking.001`): shorter than 0.1 s, with every key at the
 * rest value of what it animates. Each track gives its keyed values and that rest value.
 */
export function isRestPoseStub(
  duration: number,
  tracks: ReadonlyArray<{ values: ArrayLike<number>; rest: ArrayLike<number> }>,
): boolean {
  if (duration >= REST_POSE_STUB_SECONDS) return false;
  return tracks.every(({ values, rest }) => {
    const size = rest.length;
    if (!size) return false;
    for (let offset = 0; offset + size <= values.length; offset += size) {
      if (size === 4) {
        let dot = 0;
        for (let c = 0; c < 4; c++) dot += values[offset + c]! * rest[c]!;
        if (1 - Math.abs(dot) > 1e-4) return false;
      } else {
        for (let c = 0; c < size; c++) if (Math.abs(values[offset + c]! - rest[c]!) > 1e-3) return false;
      }
    }
    return true;
  });
}

/** Smallest change that shows: rotation in radians, translation as a fraction of the height, scale and weights. */
const MOTION_FLOOR = { rotation: (1.5 * Math.PI) / 180, translation: 0.004, other: 0.01 };

/** Whether some track of a clip moves visibly away from its first key. */
function clipMoves(clip: THREE.AnimationClip, height: number): boolean {
  return clip.tracks.some(({ name, times, values }) => {
    const size = values.length / times.length;
    for (let offset = size; offset + size <= values.length; offset += size) {
      if (name.endsWith('.quaternion') && size === 4) {
        let dot = 0;
        for (let c = 0; c < 4; c++) dot += values[c]! * values[offset + c]!;
        if (2 * Math.acos(Math.min(1, Math.abs(dot))) >= MOTION_FLOOR.rotation) return true;
        continue;
      }
      let squared = 0;
      let largest = 0;
      for (let c = 0; c < size; c++) {
        const delta = values[offset + c]! - values[c]!;
        squared += delta * delta;
        largest = Math.max(largest, Math.abs(delta));
      }
      if (name.endsWith('.position') ? Math.sqrt(squared) / height >= MOTION_FLOOR.translation : largest >= MOTION_FLOOR.other) return true;
    }
    return false;
  });
}

/** The rest value a track replaces, read before any clip plays. */
function restValue(root: THREE.Object3D, trackName: string): number[] {
  const { nodeName, propertyName } = THREE.PropertyBinding.parseTrackName(trackName);
  const node = THREE.PropertyBinding.findNode(root, nodeName) as THREE.Object3D | null;
  if (!node) return [];
  if (propertyName === 'quaternion') return node.quaternion.toArray();
  if (propertyName === 'position' || propertyName === 'scale') return node[propertyName].toArray();
  return [];
}

const SIDES = ['Left', 'Right'] as const;
const CLIP_SAMPLES = [0, 1 / 3, 2 / 3, 1];
// What broke earlier figures (choketmonster's review): thresholds from its inspection.
const MIN_JOINT_SPREAD = 0.2;
const MAX_UNWEIGHTED_SHARE = 0.01;
const MAX_HIPS_WEIGHT_SHARE = 0.45;
const MAX_FACING_DEGREES = 35;
const MAX_ARM_DROP = -0.3;
const MAX_IDLE_DRIFT = 0.15;

function armDrop(bones: ReadonlyMap<string, THREE.Bone>, side: (typeof SIDES)[number]): number | null {
  const upper = bones.get(`${side}Arm`);
  const fore = bones.get(`${side}ForeArm`);
  if (!upper || !fore) return null;
  const direction = fore.getWorldPosition(new THREE.Vector3()).sub(upper.getWorldPosition(new THREE.Vector3()));
  return direction.lengthSq() ? direction.normalize().y : null;
}

const mean = (values: readonly number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

/**
 * Checks a rigged humanoid figure the way a scene will use it: core bones present and spread over the body, every
 * vertex skinned without the hips carrying the body, facing +Z, clips that move, arms down in idle and walk, and the
 * triangle, texture and file budgets. Clips are played on `root` and its rest pose is restored afterwards.
 */
export function inspectFigure(
  root: THREE.Object3D,
  animations: readonly THREE.AnimationClip[] = [],
  { bytes, limits = DEFAULT_FIGURE_LIMITS }: { bytes?: number; limits?: AssetImportLimits } = {},
): FigureReport {
  const stats = inspectModel(root, animations);
  if (bytes !== undefined) stats.bytes = bytes;
  const issues = validateModelStats(stats, limits);
  const flag = (severity: AssetImportIssue['severity'], code: AssetImportIssue['code'], message: string) =>
    issues.push({ code, severity, message });
  const height = Math.max(stats.boundingSize[1], 1e-6);
  const allBones: THREE.Bone[] = [];
  const bones = new Map<string, THREE.Bone>();
  const skinned: THREE.SkinnedMesh[] = [];
  root.traverse((object) => {
    if (object instanceof THREE.SkinnedMesh) skinned.push(object);
    if (!(object instanceof THREE.Bone)) return;
    allBones.push(object);
    const name = humanoidBoneName(object.name);
    if (!bones.has(name)) bones.set(name, object);
  });
  const hips = bones.get('Hips');

  const heads = allBones.map((bone) => bone.getWorldPosition(new THREE.Vector3()));
  let spread = 0;
  heads.forEach((head, index) => {
    for (const other of heads.slice(index + 1)) spread = Math.max(spread, head.distanceTo(other));
  });

  let skinnedVertices = 0;
  let unweightedVertices = 0;
  let hipsWeight = 0;
  let totalWeight = 0;
  for (const mesh of skinned) {
    const joints = mesh.geometry.getAttribute('skinIndex');
    const weights = mesh.geometry.getAttribute('skinWeight');
    if (!joints || !weights) continue;
    skinnedVertices += weights.count;
    for (let vertex = 0; vertex < weights.count; vertex++) {
      let bound = 0;
      for (let slot = 0; slot < weights.itemSize; slot++) {
        const weight = weights.getComponent(vertex, slot);
        if (weight <= 1e-4) continue;
        bound += weight;
        if (hips && mesh.skeleton.bones[joints.getComponent(vertex, slot)] === hips) hipsWeight += weight;
      }
      if (!bound) unweightedVertices++;
      totalWeight += bound;
    }
  }

  // Facing +Z puts the figure's left at +X, so forward is left × up.
  const lateral = new THREE.Vector3();
  for (const [left, right] of [['LeftUpLeg', 'RightUpLeg'], ['LeftArm', 'RightArm']] as const) {
    const a = bones.get(left);
    const b = bones.get(right);
    if (a && b) lateral.add(a.getWorldPosition(new THREE.Vector3())).sub(b.getWorldPosition(new THREE.Vector3()));
  }
  const facingYaw = lateral.lengthSq() > 1e-12 ? THREE.MathUtils.radToDeg(Math.atan2(-lateral.z, lateral.x)) : null;

  const mixer = new THREE.AnimationMixer(root);
  const stubs = animations.map((clip) =>
    isRestPoseStub(clip.duration, clip.tracks.map((track) => ({ values: track.values, rest: restValue(root, track.name) }))),
  );
  const clips = animations.map((clip): FigureClipReport => {
    const drops: [number[], number[]] = [[], []];
    const path: THREE.Vector3[] = [];
    const action = mixer.clipAction(clip).setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    for (const fraction of CLIP_SAMPLES) {
      mixer.setTime(fraction * clip.duration);
      root.updateMatrixWorld(true);
      SIDES.forEach((side, index) => {
        const drop = armDrop(bones, side);
        if (drop !== null) drops[index]!.push(drop);
      });
      if (hips) path.push(hips.getWorldPosition(new THREE.Vector3()));
    }
    action.stop();
    const start = path[0];
    const drift = start ? Math.max(...path.map((point) => Math.hypot(point.x - start.x, point.z - start.z))) / height : 0;
    return { name: clip.name, duration: clip.duration, moving: clipMoves(clip, height), armDrop: [mean(drops[0]), mean(drops[1])], hipsDrift: drift };
  });
  mixer.stopAllAction();
  mixer.uncacheRoot(root);
  root.updateMatrixWorld(true);

  if (!allBones.length) flag('error', 'no-skeleton', '뼈대가 없습니다');
  const missingBones = allBones.length ? HUMANOID_CORE_BONES.filter((name) => !bones.has(name)) : [];
  if (missingBones.length) flag('error', 'missing-bones', `핵심 본이 없습니다: ${missingBones.join(', ')}`);
  if (allBones.length > 1 && spread / height < MIN_JOINT_SPREAD) {
    flag('error', 'collapsed-joints', `관절이 한곳에 모였습니다(키의 ${(spread / height).toFixed(2)})`);
  }
  if (skinnedVertices && unweightedVertices / skinnedVertices > MAX_UNWEIGHTED_SHARE) {
    flag('error', 'unweighted-vertices', `가중치 없는 정점이 ${unweightedVertices}개입니다`);
  }
  const hipsWeightShare = totalWeight ? hipsWeight / totalWeight : 0;
  if (hipsWeightShare > MAX_HIPS_WEIGHT_SHARE) {
    flag('error', 'hips-heavy-skin', `hips가 스킨 가중치의 ${Math.round(hipsWeightShare * 100)}%를 집니다`);
  }
  if (facingYaw !== null && Math.abs(facingYaw) > MAX_FACING_DEGREES) {
    flag('error', 'facing-off', `정면에서 ${Math.round(facingYaw)}° 돌아 서 있습니다`);
  }
  clips.forEach((clip, index) => {
    if (stubs[index]) flag('warning', 'rest-pose-stub', `클립 ${clip.name}은 ${clip.duration.toFixed(2)}초짜리 기본 자세입니다`);
    else if (!clip.moving) flag('warning', 'static-clip', `클립 ${clip.name}이 움직이지 않습니다`);
    const [left, right] = clip.armDrop;
    if (clip.moving && /idle|walk/i.test(clip.name) && left !== null && right !== null && Math.max(left, right) > MAX_ARM_DROP) {
      flag('error', 'arms-out', `클립 ${clip.name}에서 팔을 벌리고 있습니다(팔 내림 ${left.toFixed(2)}/${right.toFixed(2)})`);
    }
    if (/idle/i.test(clip.name) && clip.hipsDrift > MAX_IDLE_DRIFT) {
      flag('warning', 'idle-drift', `클립 ${clip.name}에서 키의 ${Math.round(clip.hipsDrift * 100)}%만큼 흘러갑니다`);
    }
  });
  const played = clips.filter((_clip, index) => !stubs[index]);
  if (allBones.length && !played.some((clip) => /idle/i.test(clip.name))) flag('warning', 'missing-idle', 'idle 클립이 없습니다');
  if (allBones.length && !played.some((clip) => /walk/i.test(clip.name))) flag('error', 'missing-walk', 'walk 클립이 없습니다');

  return {
    verdict: issues.some((issue) => issue.severity === 'error') ? 'fail' : 'pass',
    stats,
    height,
    missingBones,
    jointSpread: spread / height,
    skinnedVertices,
    unweightedVertices,
    hipsWeightShare,
    facingYaw,
    clips,
    issues,
  };
}
