import { useEffect, useRef, useState } from 'react';

import { attachGiWasm, boundsKey, createGiRuntime, packRuntimeAtlases } from './runtime';
import type { GiRuntime, GiRuntimeParams, GiVolumeProps } from './types';
import { canUseGiWorker, GiWorkerClient } from './workerClient';
import type { GiIrradiance } from '../../../rendering/tsl/types';
import { useEngineFrame } from '../../../runtime/frame';
import { logger } from '../../../utils/logger';
import { loadGiWasmModule } from '../../core/giWasm';
import { scheduledProbeBudget } from '../../core/probeSchedule';
import { GiContext } from '../../hooks/useGi';
import type { Aabb, ProbeAtlasUpload } from '../../types';

const DEFAULT_VOXEL_SIZE = 0.5;
const DEFAULT_PROBE_SPACING = 2;
const DEFAULT_RAYS_PER_PROBE = 64;
const DEFAULT_PROBES_PER_FRAME = 32;
const DEFAULT_PADDING = 4;
const DEFAULT_BLEND = 0.1;
const DEFAULT_UPLOAD_INTERVAL_MS = 100;

/** Where the probes are traced: waiting for the kernel module, in a Web Worker, or on the main thread. */
type TraceMode = 'loading' | 'worker' | 'main';

function reportError(message: string, error: unknown): void {
  logger.error(`[GiVolume Error]: ${message}`, error instanceof Error ? error : String(error));
}

/**
 * 복셀 박스를 추적해 프로브 래디언스 캐시를 갱신하고 GPU 텍스처로 올린다.
 * 프로브 추적은 기본으로 Web Worker에서 돌아 프레임이 기다리지 않는다. 워커를 쓸 수 없거나 멈추면 메인 스레드에서
 * 같은 계산을 한다. 두 경우 모두 wasm/gaesup_gi.wasm을 받을 수 있으면 WASM 커널, 없으면 같은 결과의 JS로 갱신한다.
 * 수렴한 캐시는 갱신 속도를 4분의 1로 낮추고(probeSchedule.ts), 장면이나 빛이 바뀌면 다시 올린다.
 * WebGPURenderer에서만 셰이더 모듈이 로드되며, 로드에 실패하면 children은 GI 없이 그대로 렌더링된다.
 * children은 useGi()로 받은 값의 applyToMaterial로 MeshStandardNodeMaterial에 간접광을 연결한다.
 */
export function GiVolume({
  boxes,
  environment,
  fineBounds,
  voxelSize = DEFAULT_VOXEL_SIZE,
  probeSpacing = DEFAULT_PROBE_SPACING,
  raysPerProbe = DEFAULT_RAYS_PER_PROBE,
  probesPerFrame = DEFAULT_PROBES_PER_FRAME,
  padding = DEFAULT_PADDING,
  blend = DEFAULT_BLEND,
  uploadIntervalMs = DEFAULT_UPLOAD_INTERVAL_MS,
  worker = true,
  children,
}: GiVolumeProps) {
  const [gi, setGi] = useState<GiIrradiance | null>(null);
  const [mode, setMode] = useState<TraceMode>('loading');
  const giRef = useRef<GiIrradiance | null>(null);
  const runtimeRef = useRef<GiRuntime | null>(null);
  const clientRef = useRef<GiWorkerClient | null>(null);
  const pendingRef = useRef<ProbeAtlasUpload[] | null>(null);
  const wasmModuleRef = useRef<WebAssembly.Module | null>(null);
  const modeRef = useRef<TraceMode>(mode);
  const environmentRef = useRef(environment);
  const boxesRef = useRef(boxes);
  const fineBoundsRef = useRef<Aabb | null>(fineBounds ?? null);
  const fineKey = fineBounds ? boundsKey(fineBounds) : 'none';
  const lastUploadRef = useRef(0);
  modeRef.current = mode;
  environmentRef.current = environment;
  boxesRef.current = boxes;
  fineBoundsRef.current = fineBounds ?? null;

  useEffect(() => {
    let cancelled = false;
    let created: GiIrradiance | null = null;
    import('../../../rendering/tsl/gi')
      .then(({ createGiIrradiance }) => {
        if (cancelled) return;
        created = createGiIrradiance();
        giRef.current = created;
        // Atlases the worker finished before the shader module arrived.
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending) clientRef.current?.recycle(created.updateAtlas(pending));
        setGi(created);
      })
      .catch((error: unknown) => reportError('GI 셰이더 모듈을 불러오지 못했습니다', error));
    return () => {
      cancelled = true;
      giRef.current = null;
      created?.dispose();
    };
  }, []);

  // The kernel module is fetched and compiled once on the page; the worker receives it compiled.
  useEffect(() => {
    let cancelled = false;
    void loadGiWasmModule().then((module) => {
      if (cancelled) return;
      wasmModuleRef.current = module;
      setMode(worker && canUseGiWorker() ? 'worker' : 'main');
    });
    return () => {
      cancelled = true;
    };
  }, [worker]);

  const params: GiRuntimeParams = {
    voxelSize,
    probeSpacing,
    raysPerProbe,
    padding,
    blend,
    fineBounds: fineBoundsRef.current,
  };
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    if (mode !== 'worker') return undefined;
    let client: GiWorkerClient | null = null;
    try {
      client = new GiWorkerClient(
        wasmModuleRef.current,
        { probesPerTick: probesPerFrame, uploadIntervalMs },
        {
          onAtlas: (levels) => {
            const irradiance = giRef.current;
            if (!irradiance) {
              const stale = pendingRef.current;
              pendingRef.current = levels;
              if (stale) clientRef.current?.recycle(stale.map((level) => level.atlas));
              return;
            }
            clientRef.current?.recycle(irradiance.updateAtlas(levels));
          },
          onError: (error) => {
            reportError('GI 워커가 멈춰 메인 스레드에서 계산합니다', error);
            setMode('main');
          },
        },
      );
    } catch (error) {
      reportError('GI 워커를 시작하지 못해 메인 스레드에서 계산합니다', error);
      setMode('main');
      return undefined;
    }
    clientRef.current = client;
    client.setScene(boxesRef.current, paramsRef.current, environmentRef.current);
    // A hidden tab draws nothing; its worker should not keep a core busy either.
    const visibility = () => client?.setPaused(document.visibilityState === 'hidden');
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      client?.dispose();
      if (clientRef.current === client) clientRef.current = null;
    };
  }, [mode, probesPerFrame, uploadIntervalMs]);

  useEffect(() => {
    if (mode === 'worker') {
      clientRef.current?.setScene(boxes, paramsRef.current, environmentRef.current);
      return;
    }
    if (mode !== 'main') return;
    try {
      const previous = runtimeRef.current;
      const next = createGiRuntime(previous, boxes, paramsRef.current, environmentRef.current);
      runtimeRef.current = next;
      const module = wasmModuleRef.current;
      if (next && next !== previous && module) void attachGiWasm(next, module);
    } catch (error) {
      runtimeRef.current = null;
      reportError('GI 볼륨을 만들지 못했습니다', error);
    }
  }, [mode, boxes, voxelSize, probeSpacing, raysPerProbe, padding, blend, fineKey]);

  useEffect(() => {
    if (mode === 'worker') clientRef.current?.setEnvironment(environment);
    else runtimeRef.current?.cascade.setEnvironment(environment);
  }, [mode, environment]);

  // Without a worker, probe updates run with the other per-frame effects on the engine's frame scheduler.
  useEngineFrame('effects', () => {
    if (modeRef.current !== 'main') return;
    const runtime = runtimeRef.current;
    const irradiance = giRef.current;
    if (!runtime || !irradiance) return;
    runtime.cascade.update(scheduledProbeBudget(probesPerFrame, runtime.cascade.passesSinceChange));
    if (runtime.cascade.version === runtime.uploadedVersion) return;
    const now = performance.now();
    if (now - lastUploadRef.current < uploadIntervalMs) return;
    runtime.spareAtlases.push(...irradiance.updateAtlas(packRuntimeAtlases(runtime)));
    lastUploadRef.current = now;
  });

  return <GiContext.Provider value={gi}>{children}</GiContext.Provider>;
}
