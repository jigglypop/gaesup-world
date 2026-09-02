import fs from 'fs';
import path from 'path';

import { GAESUP_SKELETON_ID } from '../../character/skeleton';
import { SEED_ASSETS } from '../data/seedAssets';

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const PARTS_DIR = path.join(ROOT, 'public', 'gltf', 'parts');
const MANIFEST_PATH = path.join(PARTS_DIR, 'manifest.json');
const GENERATED_SLOTS = ['bottom', 'shoes', 'weapon'] as const;

type ManifestPart = {
  id: string;
  slot: string;
  kind: string;
  file: string;
  url: string;
  skeleton: string;
  deformation: string;
  bones: string[];
  compatibility?: string;
  jointCount?: number;
};

type PartsManifest = {
  version: number;
  skeleton: string;
  body: { bones: string[]; handRight: string; jointCount?: number };
  parts: ManifestPart[];
};

function readManifest(): PartsManifest {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as PartsManifest;
}

describe('Blender 생성 캐릭터 파츠 manifest', () => {
  test('manifest는 gaesup-humanoid-v1 스켈레톤으로 bottom/shoes/weapon 파츠를 기록한다', () => {
    const manifest = readManifest();
    expect(manifest.version).toBe(1);
    expect(manifest.skeleton).toBe(GAESUP_SKELETON_ID);
    expect(manifest.parts.map((part) => part.slot).sort()).toEqual([...GENERATED_SLOTS].sort());
    expect(manifest.body.bones.length).toBeGreaterThan(0);
    expect(manifest.body.bones).toContain(manifest.body.handRight);
  });
  test('모든 파츠 GLB는 존재하고 body 스켈레톤과 호환되며 사용 본이 body 본의 부분집합이다', () => {
    const manifest = readManifest();
    const bodyBones = new Set(manifest.body.bones);
    for (const part of manifest.parts) {
      const filePath = path.join(PARTS_DIR, part.file);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).size).toBeGreaterThan(0);
      expect(part.skeleton).toBe(GAESUP_SKELETON_ID);
      expect(part.deformation).toBe('skinned');
      expect(['identical', 'remappable']).toContain(part.compatibility);
      expect(part.jointCount).toBe(manifest.body.jointCount);
      expect(part.bones.length).toBeGreaterThan(0);
      for (const bone of part.bones) expect(bodyBones.has(bone)).toBe(true);
    }
  });
  test('seed 카탈로그의 starter 슬롯 항목은 placeholder 대신 생성 파츠 URL과 스켈레톤 메타데이터를 가진다', () => {
    const manifest = readManifest();
    for (const part of manifest.parts) {
      const seed = SEED_ASSETS.find((asset) => asset.url === part.url);
      expect(seed).toBeDefined();
      expect(seed?.slot).toBe(part.slot);
      expect(seed?.kind).toBe(part.kind);
      expect(seed?.metadata?.['placeholder']).toBeUndefined();
      expect(seed?.metadata?.['skeleton']).toBe(GAESUP_SKELETON_ID);
      expect(seed?.metadata?.['deformation']).toBe(part.deformation);
      expect(fs.existsSync(path.join(ROOT, 'public', part.url))).toBe(true);
    }
    for (const slot of GENERATED_SLOTS) {
      const placeholders = SEED_ASSETS.filter(
        (asset) => asset.slot === slot && asset.metadata?.['placeholder'] === true,
      );
      expect(placeholders).toEqual([]);
    }
  });
});
