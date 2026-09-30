import * as THREE from 'three';

import { DEFAULT_WORLD_GI_ENVIRONMENT, environmentChanged, readSceneLight, receivesWorldGi } from '../sceneLight';

function sunAt(x: number, y: number, z: number, intensity: number, castShadow: boolean): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(x, y, z);
  light.castShadow = castShadow;
  return light;
}

describe('WorldGi scene light', () => {
  it('빛이 없으면 맑은 낮 하늘을 쓴다', () => {
    expect(readSceneLight(new THREE.Scene())).toEqual(DEFAULT_WORLD_GI_ENVIRONMENT);
  });

  it('그림자를 드리우는 방향광을 해로 읽고, 과녁에서 해 쪽을 향한다', () => {
    const scene = new THREE.Scene();
    scene.add(sunAt(0, 10, 0, 5, false));
    scene.add(sunAt(10, 10, 0, 2, true));
    const environment = readSceneLight(scene);
    expect(environment.sunDirection.x).toBeCloseTo(Math.SQRT1_2);
    expect(environment.sunDirection.y).toBeCloseTo(Math.SQRT1_2);
    expect(environment.sunDirection.z).toBeCloseTo(0);
    expect(environment.sunIrradiance).toEqual([2, 2, 2]);
  });

  it('반구광을 하늘로 읽고 지평선은 하늘과 땅 사이로 둔다', () => {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(new THREE.Color(1, 1, 1), new THREE.Color(0, 0, 0), 2));
    const { skyZenith, skyGround, skyHorizon, sunDirection } = readSceneLight(scene);
    expect(skyZenith).toEqual([2, 2, 2]);
    expect(skyGround).toEqual([0, 0, 0]);
    expect(skyHorizon[0]).toBeCloseTo(1.3);
    expect(sunDirection).toEqual(DEFAULT_WORLD_GI_ENVIRONMENT.sunDirection);
  });

  it('작은 흔들림은 무시하고 눈에 띄는 변화만 넘긴다', () => {
    const base = DEFAULT_WORLD_GI_ENVIRONMENT;
    const nudged = { ...base, sunDirection: { ...base.sunDirection, x: base.sunDirection.x + 0.001 } };
    const moved = { ...base, sunIrradiance: [3, 3, 3] as const };
    expect(environmentChanged(base, nudged)).toBe(false);
    expect(environmentChanged(base, moved)).toBe(true);
  });
});

describe('WorldGi receivers', () => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry());

  it('불투명한 표준 재질만 간접광을 받는다', () => {
    expect(receivesWorldGi(mesh, new THREE.MeshStandardMaterial())).toBe(true);
    expect(receivesWorldGi(mesh, new THREE.MeshPhysicalMaterial())).toBe(true);
    expect(receivesWorldGi(mesh, new THREE.MeshBasicMaterial())).toBe(false);
    expect(receivesWorldGi(mesh, new THREE.MeshStandardMaterial({ transparent: true }))).toBe(false);
  });

  it('재질이나 메시의 userData.gi = false는 빼 둔다', () => {
    const material = new THREE.MeshStandardMaterial();
    material.userData['gi'] = false;
    expect(receivesWorldGi(mesh, material)).toBe(false);
    const quiet = new THREE.Mesh(new THREE.BoxGeometry());
    quiet.userData['gi'] = false;
    expect(receivesWorldGi(quiet, new THREE.MeshStandardMaterial())).toBe(false);
  });
});
