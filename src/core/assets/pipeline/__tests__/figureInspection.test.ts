import * as THREE from 'three';

import { figureClipName, humanoidBoneName, inspectFigure, isRestPoseStub } from '../modelInspection';

// A 1.7 m figure in a T pose facing +Z (its left at +X): joint, parent, world position.
const JOINTS: ReadonlyArray<readonly [string, string | null, number, number, number]> = [
  ['Hips', null, 0, 0.9, 0],
  ['Spine', 'Hips', 0, 1.1, 0],
  ['Neck', 'Spine', 0, 1.45, 0],
  ['Head', 'Neck', 0, 1.55, 0],
  ['LeftArm', 'Spine', 0.2, 1.4, 0],
  ['LeftForeArm', 'LeftArm', 0.45, 1.4, 0],
  ['LeftHand', 'LeftForeArm', 0.7, 1.4, 0],
  ['RightArm', 'Spine', -0.2, 1.4, 0],
  ['RightForeArm', 'RightArm', -0.45, 1.4, 0],
  ['RightHand', 'RightForeArm', -0.7, 1.4, 0],
  ['LeftUpLeg', 'Hips', 0.1, 0.85, 0],
  ['LeftLeg', 'LeftUpLeg', 0.1, 0.45, 0],
  ['LeftFoot', 'LeftLeg', 0.1, 0.05, 0],
  ['RightUpLeg', 'Hips', -0.1, 0.85, 0],
  ['RightLeg', 'RightUpLeg', -0.1, 0.45, 0],
  ['RightFoot', 'RightLeg', -0.1, 0.05, 0],
];

type FigureOptions = { jointScale?: number; hipsWeight?: number; unweighted?: boolean; skip?: string };

/**
 * One box per joint, each skinned to its joint and `hipsWeight` to the hips (the hands to nothing when `unweighted`);
 * the head box tops out at 1.7 m.
 */
function buildFigure({ jointScale = 1, hipsWeight = 0, unweighted = false, skip }: FigureOptions = {}) {
  const root = new THREE.Group();
  const bones: THREE.Bone[] = [];
  const world = new Map<string, THREE.Vector3>();
  const positions: number[] = [];
  const indices: number[] = [];
  const skinIndex: number[] = [];
  const skinWeight: number[] = [];
  JOINTS.forEach(([name, parent, x, y, z], joint) => {
    const bone = new THREE.Bone();
    bone.name = name === skip ? 'Extra' : `mixamorig${name}`;
    const at = new THREE.Vector3(x, y, z);
    world.set(name, at.clone().multiplyScalar(jointScale));
    bone.position.copy(at).multiplyScalar(jointScale).sub(parent ? world.get(parent)! : new THREE.Vector3());
    (parent ? bones[JOINTS.findIndex(([other]) => other === parent)]! : root).add(bone);
    bones.push(bone);
    const size = name === 'Head' ? 0.3 : 0.1;
    const center = new THREE.Vector3(x, name === 'Head' ? 1.55 : name.endsWith('Foot') ? 0.05 : y, z);
    const base = positions.length / 3;
    const bound = unweighted && name.endsWith('Hand') ? 0 : 1;
    for (let corner = 0; corner < 8; corner++) {
      positions.push(center.x + ((corner & 1) - 0.5) * size, center.y + (((corner >> 1) & 1) - 0.5) * size, center.z + ((corner >> 2) - 0.5) * size);
      skinIndex.push(joint, 0, 0, 0);
      skinWeight.push(bound * (1 - hipsWeight), bound * hipsWeight, 0, 0);
    }
    for (const face of [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]) {
      const [a, b, c, d] = face.map((corner) => base + corner) as [number, number, number, number];
      indices.push(a, b, c, a, c, d);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
  geometry.setIndex(indices);
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshStandardMaterial());
  root.add(mesh);
  root.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  return root;
}

const turn = (axis: THREE.Vector3, degrees: number) => new THREE.Quaternion().setFromAxisAngle(axis, THREE.MathUtils.degToRad(degrees));
const Z = new THREE.Vector3(0, 0, 1);
const X = new THREE.Vector3(1, 0, 0);

/** A looping clip whose bones sway between two poses; arms hang down unless `armsDown` is false. */
function clip(name: string, { armsDown = true, sway = 20, duration = 1 } = {}): THREE.AnimationClip {
  const track = (bone: string, from: THREE.Quaternion, to: THREE.Quaternion) =>
    new THREE.QuaternionKeyframeTrack(`mixamorig${bone}.quaternion`, [0, duration / 2, duration], [...from.toArray(), ...to.toArray(), ...from.toArray()]);
  const tracks = [
    track('LeftUpLeg', turn(X, sway), turn(X, -sway)),
    track('RightUpLeg', turn(X, -sway), turn(X, sway)),
  ];
  if (armsDown) tracks.push(track('LeftArm', turn(Z, -80), turn(Z, -80)), track('RightArm', turn(Z, 80), turn(Z, 80)));
  return new THREE.AnimationClip(name, duration, tracks);
}

const restpose = () =>
  new THREE.AnimationClip('restpose', 0.05, [new THREE.QuaternionKeyframeTrack('mixamorigHips.quaternion', [0, 0.05], [0, 0, 0, 1, 0, 0, 0, 1])]);
const codes = (report: ReturnType<typeof inspectFigure>) => report.issues.map((issue) => `${issue.severity}:${issue.code}`);

describe('인물 검사', () => {
  test('리그·가중치·방향·클립이 맞는 인물은 통과하고 검사 뒤 기본 자세로 돌아온다', () => {
    const root = buildFigure({ hipsWeight: 0.1 });
    const arm = root.getObjectByName('mixamorigLeftArm')!;
    const rest = arm.quaternion.clone();
    const report = inspectFigure(root, [clip('Idle', { sway: 3 }), clip('Walking')], { bytes: 1_000_000 });
    expect(report.verdict).toBe('pass');
    expect(report.issues).toEqual([]);
    expect(report.height).toBeCloseTo(1.7);
    expect(report.missingBones).toEqual([]);
    expect(report.facingYaw).toBeCloseTo(0);
    // The hips box carries all its weight, the other 15 boxes a tenth each.
    expect(report.hipsWeightShare).toBeCloseTo((1 + 15 * 0.1) / 16);
    expect(report.clips.map((entry) => [entry.name, entry.moving])).toEqual([['Idle', true], ['Walking', true]]);
    for (const drop of report.clips[0]!.armDrop) expect(drop).toBeLessThan(-0.95);
    expect(arm.quaternion.equals(rest)).toBe(true);
  });

  test('idle과 walk에서 팔을 벌린 인물은 실패하고, 클립마다 따로 잰다', () => {
    // Walking first: its arm keys must not linger into the idle's measurement.
    const report = inspectFigure(buildFigure(), [clip('Walking'), clip('Idle', { armsDown: false, sway: 3 })]);
    expect(report.verdict).toBe('fail');
    expect(codes(report)).toEqual(['error:arms-out']);
    expect(report.clips[1]!.armDrop).toEqual([expect.closeTo(0, 5), expect.closeTo(0, 5)]);
  });

  test('hips에 쏠린 가중치, 가중치 없는 정점, 모인 관절, 빠진 본, 돌아선 몸을 잡는다', () => {
    const clips = [clip('Idle', { sway: 3 }), clip('Walking')];
    expect(codes(inspectFigure(buildFigure({ hipsWeight: 0.6 }), clips))).toEqual(['error:hips-heavy-skin']);
    expect(codes(inspectFigure(buildFigure({ unweighted: true }), clips))).toEqual(['error:unweighted-vertices']);
    expect(codes(inspectFigure(buildFigure({ jointScale: 0.01 }), clips))).toContain('error:collapsed-joints');
    expect(codes(inspectFigure(buildFigure({ skip: 'LeftFoot' }), clips))).toEqual(['error:missing-bones']);
    const turned = buildFigure();
    turned.rotation.y = Math.PI / 2;
    const report = inspectFigure(turned, clips);
    expect(report.facingYaw).toBeCloseTo(90);
    expect(codes(report)).toEqual(['error:facing-off']);
  });

  test('움직이지 않는 클립, 기본 자세 스텁, 빠진 idle·walk와 예산 초과를 알린다', () => {
    const still = clip('Wave', { armsDown: false, sway: 0 });
    const report = inspectFigure(buildFigure(), [still, restpose()], { bytes: 5_000_000 });
    expect(codes(report)).toEqual([
      'warning:file-too-large',
      'warning:static-clip',
      'warning:rest-pose-stub',
      'warning:missing-idle',
      'error:missing-walk',
    ]);
    expect(codes(inspectFigure(new THREE.Group()))).toEqual(['error:empty-model', 'error:no-skeleton']);
  });
});

describe('인물 규약', () => {
  test('Mixamo·Unity 본 이름과 클립 철자를 엔진 이름으로 맞춘다', () => {
    expect(['mixamorig:Hips', 'mixamorig1:LeftArm', 'mixamorig_Spine', 'mixamorigHead', 'leftUpperArm', 'RightLowerLeg'].map(humanoidBoneName))
      .toEqual(['Hips', 'LeftArm', 'Spine', 'Head', 'LeftArm', 'RightLeg']);
    expect(['Idle', 'Walking', 'Running', 'Wave_One_Hand', 'preset:biped:look_around', 'Armature|Walking', 'Idle_4', 'Walking.001'].map(figureClipName))
      .toEqual(['idle', 'walk', 'run', 'wave', 'look', 'walk', undefined, undefined]);
  });

  test('0.1초 미만이면서 모든 키가 기본값인 클립만 스텁이다', () => {
    const rest = { values: [0, 0, 0, 1, 0, 0, 0, -1], rest: [0, 0, 0, 1] };
    expect(isRestPoseStub(0.08, [rest, { values: [1, 2, 3], rest: [1, 2, 3] }])).toBe(true);
    expect(isRestPoseStub(0.5, [rest])).toBe(false);
    expect(isRestPoseStub(0.08, [{ values: [0, 0.2, 0, 0.98], rest: [0, 0, 0, 1] }])).toBe(false);
    expect(isRestPoseStub(0.08, [{ values: [0], rest: [] }])).toBe(false);
  });
});
