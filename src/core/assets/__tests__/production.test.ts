import {
  ASSET_BUDGET_PROFILES,
  ManifestAssetSource,
  assetApprovalSubject,
  assetPublicationBlockers,
  validateAssetManifest,
} from 'gaesup-world/assets';
import type { AssetEvidence, AssetManifest, AssetQualityReport } from 'gaesup-world/assets';

const fixture = (): AssetManifest => ({
  schemaVersion: 1,
  id: 'reference-sofa',
  version: '1.0.0',
  name: 'Sofa',
  kind: 'object3d',
  source: {
    author: 'artist',
    license: 'owned',
    sourcePath: 'sofa.blend',
    generator: 'Blender 5.2.1',
  },
  artifacts: [0, 1, 2].map((level) => ({
    path: `lod${level}.glb`,
    sha256: 'a'.repeat(64),
    bytes: 100,
  })),
  lods: ([0, 1, 2] as const).map((level) => ({
    level,
    path: `lod${level}.glb`,
    triangles: 100,
    minScreenPixels: 0,
  })),
  bounds: { min: [-1, 0, -1], max: [1, 1, 1] },
  materials: [],
  colliders: [],
  sockets: [],
});
const qualityFor = (manifest: AssetManifest): AssetQualityReport => {
  const evidence: AssetEvidence = {
    subject: assetApprovalSubject(manifest),
    decision: 'approved',
    reviewer: 'artist',
    recordedAt: '2026-09-09T00:00:00Z',
    evidence: ['evidence/capture.png'],
  };
  return {
    provenance: evidence,
    technical: evidence,
    art: evidence,
    browser: (['android', 'iphone', 'integrated-gpu'] as const).map((device) => {
      const profile = device === 'integrated-gpu' ? 'desktop' : 'mobile';
      const { id: _id, policyVersion: _version, ...metrics } = ASSET_BUDGET_PROFILES[profile];
      return {
        ...evidence,
        device,
        model: 'device-1',
        os: 'os-1',
        browser: 'browser-1',
        backend: 'webgl',
        profile,
        policyVersion: 1,
        sceneVersion: 'reference-v1',
        metrics,
        durationMinutes: 15,
        roomTransitions: 30,
        outfitSwaps: 100,
        contextRecovery: true,
      };
    }),
  };
};

test('publication requires four independent, current evidence gates', () => {
  const manifest = fixture();
  const quality = qualityFor(manifest);
  expect(assetPublicationBlockers(manifest, quality)).toEqual([]);
  expect(assetPublicationBlockers(manifest, { browser: [] })).toHaveLength(6);
  manifest.artifacts[0]!.sha256 = 'b'.repeat(64);
  expect(assetPublicationBlockers(manifest, quality)).toContain('art');
});

test('semantic changes invalidate approval, JSON object key ordering does not', () => {
  const manifest = fixture();
  expect(assetApprovalSubject({ ...manifest, name: manifest.name })).toBe(
    assetApprovalSubject(manifest),
  );
  const report = qualityFor(manifest);
  manifest.sockets.push({ name: 'seat', position: [0, 0.5, 0] });
  expect(assetPublicationBlockers(manifest, report)).toContain('technical');
});

test('missing, over-budget and later rejected browser evidence blocks release', () => {
  const manifest = fixture();
  const report = qualityFor(manifest);
  report.browser[0]!.metrics.textureBytes++;
  expect(assetPublicationBlockers(manifest, report)).toContain('browser:android');
  report.browser.push({ ...report.browser[1]!, decision: 'rejected' });
  expect(assetPublicationBlockers(manifest, report)).toContain('browser:iphone');
});

test('unsafe artifacts and malformed external JSON never pass', () => {
  const manifest = fixture();
  manifest.artifacts[0]!.path = '../escape.glb';
  expect(validateAssetManifest(manifest)).toContain('invalid-artifact-path');
  expect(validateAssetManifest(JSON.parse('{}') as AssetManifest)).not.toEqual([]);
  expect(assetPublicationBlockers(fixture(), JSON.parse('{}') as AssetQualityReport)).not.toEqual(
    [],
  );
});

test('published source excludes drafts and does not expose mutable internal records', async () => {
  const manifest = fixture();
  const source = new ManifestAssetSource(
    [
      { manifest, quality: qualityFor(manifest) },
      { manifest: { ...manifest, id: 'draft-sofa' }, quality: { browser: [] } },
    ],
    '/production-assets',
  );
  const records = await source.listByKind('object3d');
  expect(records).toHaveLength(1);
  expect(records[0]!.url).toBe('/production-assets/reference-sofa/1.0.0/lod0.glb');
  records[0]!.name = 'mutated';
  expect((await source.getAsset(manifest.id))!.name).toBe('Sofa');
});
