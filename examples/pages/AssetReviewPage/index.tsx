import { Suspense, useEffect, useRef, useState } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
  assetApprovalSubject,
  assetPublicationBlockers,
  validateAssetManifest,
} from 'gaesup-world/assets';
import type { AssetManifest, AssetQualityReport } from 'gaesup-world/assets';

import './styles.css';

function collectSceneDisposal(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const skeletons = new Set<THREE.Skeleton>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    if (object instanceof THREE.SkinnedMesh) skeletons.add(object.skeleton);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  return () => {
    for (const value of [...geometries, ...materials, ...textures, ...skeletons]) value.dispose();
  };
}

function ReviewModel({
  url,
  cameraView,
  silhouette,
  onError,
  onReady,
}: {
  url: string;
  cameraView: string;
  silhouette: boolean;
  onError: (error: string) => void;
  onReady: (url: string) => void;
}) {
  const [scene, setScene] = useState<THREE.Group>();
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    void loader.loadAsync(url).then(
      (gltf) => {
        if (cancelled) {
          collectSceneDisposal(gltf.scene)();
          return;
        }
        setScene(gltf.scene);
        onReady(url);
      },
      () => {
        if (!cancelled) onError('GLB를 불러오지 못했습니다. 이전 미리보기를 유지합니다.');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url, onError, onReady]);
  useEffect(() => (scene ? collectSceneDisposal(scene) : undefined), [scene]);
  useEffect(() => {
    if (!scene) return;
    const bounds = new THREE.Box3().setFromObject(scene);
    const center = bounds.getCenter(new THREE.Vector3());
    const distance = Math.max(bounds.getSize(new THREE.Vector3()).length(), 1);
    camera.position
      .copy(center)
      .add(
        new THREE.Vector3(
          cameraView === 'side' ? distance : 0,
          distance * 0.25,
          cameraView === 'side' ? 0 : distance * (cameraView === 'play' ? 2 : 1),
        ),
      );
    camera.lookAt(center);
    if (controls && 'target' in controls && controls.target instanceof THREE.Vector3)
      controls.target.copy(center);
    camera.updateMatrixWorld();
  }, [scene, camera, cameraView, controls]);
  useEffect(() => {
    if (!scene || !silhouette) return;
    const gray = new THREE.MeshStandardMaterial({ color: '#999999', roughness: 0.8 });
    const originals: { mesh: THREE.Mesh; material: THREE.Material | THREE.Material[] }[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        originals.push({ mesh: object, material: object.material });
        object.material = gray;
      }
    });
    return () => {
      originals.forEach(({ mesh, material }) => {
        mesh.material = material;
      });
      gray.dispose();
    };
  }, [scene, silhouette]);
  return scene ? <primitive object={scene} dispose={null} /> : null;
}

export default function AssetReviewPage() {
  const [manifest, setManifest] = useState<AssetManifest>();
  const [quality, setQuality] = useState<AssetQualityReport>({ browser: [] });
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [lod, setLod] = useState(0);
  const [variant, setVariant] = useState('primary');
  const [readyUrl, setReadyUrl] = useState('');
  const [cameraView, setCameraView] = useState('front');
  const [silhouette, setSilhouette] = useState(false);
  const [reviewer, setReviewer] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const selection = useRef(0);
  useEffect(
    () => () => {
      Object.values(urls).forEach(URL.revokeObjectURL);
    },
    [urls],
  );
  const handleImport = async (files: FileList | null) => {
    if (!files) return;
    const request = ++selection.current;
    try {
      const entries = Array.from(files);
      const manifestFile = entries.find((file) => file.name === 'manifest.json');
      if (!manifestFile) throw new Error('manifest.json과 납품 GLB를 함께 선택하세요.');
      const next: AssetManifest = JSON.parse(await manifestFile.text());
      const problems = validateAssetManifest(next);
      if (problems.length) throw new Error(problems.join(', '));
      const verified: [string, File][] = [];
      for (const artifact of next.artifacts) {
        const matches = entries.filter(
          (file) =>
            file.name === artifact.path || file.webkitRelativePath.endsWith(`/${artifact.path}`),
        );
        if (matches.length !== 1) throw new Error(`파일 누락 또는 중복: ${artifact.path}`);
        const file = matches[0]!;
        const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
        const hash = Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, '0'),
        ).join('');
        if (hash !== artifact.sha256 || file.size !== artifact.bytes)
          throw new Error(`파일 해시 불일치: ${artifact.path}`);
        verified.push([artifact.path, file]);
      }
      const qualityFile = entries.find((file) => file.name === 'quality.json');
      const nextQuality: AssetQualityReport = qualityFile
        ? JSON.parse(await qualityFile.text())
        : { browser: [] };
      if (request !== selection.current) return;
      setUrls(Object.fromEntries(verified.map(([key, file]) => [key, URL.createObjectURL(file)])));
      setManifest(next);
      setQuality(nextQuality);
      setLod(0);
      setError('');
    } catch (reason) {
      if (request === selection.current)
        setError(reason instanceof Error ? reason.message : '가져오기 실패');
    }
  };
  const handleExport = (decision: 'approved' | 'rejected') => {
    if (!manifest || !reviewer.trim() || !note.trim() || !url || readyUrl !== url) return;
    const evidence = {
      subject: assetApprovalSubject(manifest),
      decision,
      reviewer,
      recordedAt: new Date().toISOString(),
      evidence: [note],
      reviewView: { cameraView, lod, silhouette, variant, artifactPath: selectedPath },
    };
    const downloadUrl = URL.createObjectURL(
      new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `${manifest.id}-art-${decision}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };
  const selected = manifest?.lods.find((entry) => entry.level === lod);
  const selectedPath = selected
    ? variant === 'fallback'
      ? selected.fallbackPath
      : selected.path
    : undefined;
  const url = selectedPath ? urls[selectedPath] : undefined;
  return (
    <main className="asset-review">
      <h1>제품 에셋 검수</h1>
      <p>
        동일한 카메라와 조명에서 납품본을 확인합니다. 아트 결정은 CLI로 기록하며 브라우저 성능
        승인은 별도입니다.
      </p>
      <label>
        manifest.json · quality.json · GLB 함께 선택{' '}
        <input
          type="file"
          multiple
          accept=".json,.glb,.ktx2,.png,.jpg"
          onChange={(event) => {
            void handleImport(event.target.files);
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="asset-review-controls">
        <label>
          납품 변형본{' '}
          <select value={variant} onChange={(event) => setVariant(event.target.value)}>
            <option value="primary">기본 압축본</option>
            <option value="fallback">저해상도 대체본</option>
          </select>
        </label>
        <label>
          시점{' '}
          <select value={cameraView} onChange={(event) => setCameraView(event.target.value)}>
            <option value="front">정면</option>
            <option value="side">측면</option>
            <option value="play">플레이 거리</option>
          </select>
        </label>
        <label>
          LOD{' '}
          <select value={lod} onChange={(event) => setLod(Number(event.target.value))}>
            {[0, 1, 2].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={silhouette}
            onChange={(event) => setSilhouette(event.target.checked)}
          />
          회색 실루엣
        </label>
      </div>
      <div className="asset-review-canvas">
        {url ? (
          <Canvas camera={{ position: [0, 1, 4], fov: 42 }} dpr={1}>
            <color attach="background" args={['#eee9df']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[3, 5, 4]} intensity={2} />
            <Suspense fallback={null}>
              <ReviewModel
                url={url}
                cameraView={cameraView}
                silhouette={silhouette}
                onError={setError}
                onReady={setReadyUrl}
              />
            </Suspense>
            <OrbitControls makeDefault enablePan={false} />
          </Canvas>
        ) : (
          <p>납품 파일을 선택하면 검수 미리보기가 열립니다.</p>
        )}
      </div>
      {manifest && (
        <>
          <h2>
            {manifest.name} · {manifest.version}
          </h2>
          <p>
            공개 미충족 항목: {assetPublicationBlockers(manifest, quality).join(', ') || '없음'}
          </p>
          <label>
            검수자 <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
          </label>
          <label>
            검수 근거 / 캡처 경로{' '}
            <textarea value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button
            disabled={!reviewer.trim() || !note.trim() || !url || readyUrl !== url}
            onClick={() => handleExport('approved')}
          >
            아트 승인 기록 내려받기
          </button>
          <button
            disabled={!reviewer.trim() || !note.trim() || !url || readyUrl !== url}
            onClick={() => handleExport('rejected')}
          >
            수정 요청 기록 내려받기
          </button>
        </>
      )}
    </main>
  );
}
