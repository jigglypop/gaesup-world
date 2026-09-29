import { useEffect, useRef, useState } from 'react';

import { useFrame } from '@react-three/fiber';

import type { GiIrradiance } from '../../../rendering/tsl/types';
import { logger } from '../../../utils/logger';
import { GiContext } from '../../hooks/useGi';
import { createGiRuntime } from './runtime';
import type { GiRuntime, GiVolumeProps } from './types';

const DEFAULT_VOXEL_SIZE = 0.5;
const DEFAULT_PROBE_SPACING = 2;
const DEFAULT_RAYS_PER_PROBE = 48;
const DEFAULT_PROBES_PER_FRAME = 48;
const DEFAULT_PADDING = 4;
const DEFAULT_BLEND = 0.2;
const DEFAULT_UPLOAD_INTERVAL_MS = 100;

function reportError(message: string, error: unknown): void {
  logger.error(`[GiVolume Error]: ${message}`, error instanceof Error ? error : String(error));
}

/**
 * 복셀 박스를 추적해 프로브 래디언스 캐시를 갱신하고 GPU 텍스처로 올린다.
 * WebGPURenderer에서만 셰이더 모듈이 로드되며, 로드에 실패하면 children은 GI 없이 그대로 렌더링된다.
 * children은 useGi()로 받은 값의 applyToMaterial로 MeshStandardNodeMaterial에 간접광을 연결한다.
 */
export function GiVolume({
  boxes,
  environment,
  voxelSize = DEFAULT_VOXEL_SIZE,
  probeSpacing = DEFAULT_PROBE_SPACING,
  raysPerProbe = DEFAULT_RAYS_PER_PROBE,
  probesPerFrame = DEFAULT_PROBES_PER_FRAME,
  padding = DEFAULT_PADDING,
  blend = DEFAULT_BLEND,
  uploadIntervalMs = DEFAULT_UPLOAD_INTERVAL_MS,
  children,
}: GiVolumeProps) {
  const [gi, setGi] = useState<GiIrradiance | null>(null);
  const giRef = useRef<GiIrradiance | null>(null);
  const runtimeRef = useRef<GiRuntime | null>(null);
  const environmentRef = useRef(environment);
  const lastUploadRef = useRef(0);
  environmentRef.current = environment;

  useEffect(() => {
    let cancelled = false;
    let created: GiIrradiance | null = null;
    import('../../../rendering/tsl/gi')
      .then(({ createGiIrradiance }) => {
        if (cancelled) return;
        created = createGiIrradiance();
        giRef.current = created;
        setGi(created);
      })
      .catch((error: unknown) => reportError('GI 셰이더 모듈을 불러오지 못했습니다', error));
    return () => {
      cancelled = true;
      giRef.current = null;
      created?.dispose();
    };
  }, []);

  useEffect(() => {
    try {
      runtimeRef.current = createGiRuntime(
        runtimeRef.current,
        boxes,
        { voxelSize, probeSpacing, raysPerProbe, padding, blend },
        environmentRef.current,
      );
    } catch (error) {
      runtimeRef.current = null;
      reportError('GI 볼륨을 만들지 못했습니다', error);
    }
  }, [boxes, voxelSize, probeSpacing, raysPerProbe, padding, blend]);

  useEffect(() => {
    runtimeRef.current?.volume.setEnvironment(environment);
  }, [environment]);

  useFrame(() => {
    const runtime = runtimeRef.current;
    const irradiance = giRef.current;
    if (!runtime || !irradiance) return;
    runtime.volume.update(probesPerFrame);
    if (runtime.volume.version === runtime.uploadedVersion) return;
    const now = performance.now();
    if (now - lastUploadRef.current < uploadIntervalMs) return;
    irradiance.update(runtime.volume.config, runtime.volume.exportFaceData(runtime.exportBuffer));
    runtime.uploadedVersion = runtime.volume.version;
    lastUploadRef.current = now;
  });

  return <GiContext.Provider value={gi}>{children}</GiContext.Provider>;
}
