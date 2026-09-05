import { useCallback, useMemo, useRef, useState } from 'react';

import { useAssetStore, type AssetRecord } from '../../../../assets';
import {
  createContentBundleFromSaveSystem,
  validateContentBundle,
  type ContentBundle,
  type ContentBundleValidation,
} from '../../../../content';
import { SEED_GAMEPLAY_EVENTS, type GameplayEventBlueprint } from '../../../../gameplay';
import {
  createAgentBehaviorBlueprintFromNPCBehaviorBlueprint,
  createNPCBehaviorBlueprintFromInstance,
  useNPCStore,
  type AgentBehaviorBlueprint,
  type NPCBehaviorBlueprint,
} from '../../../../npc';
import { useGaesupRuntime } from '../../../../runtime';
import { getSaveSystem } from '../../../../save';
import { logger } from '../../../../utils/logger';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';

type StudioStatusKind = 'idle' | 'success' | 'error';

type StudioStatus = {
  kind: StudioStatusKind;
  message: string;
};

const DEFAULT_BUNDLE_ID = 'studio-social-world';
const DEFAULT_BUNDLE_NAME = '스튜디오 소셜 월드';
const DEFAULT_VERSION = '1.0.0';

export type StudioPanelBundleContext = {
  assets: AssetRecord[];
  bundleId: string;
  bundleName: string;
  version: string;
  gameplayEvents: GameplayEventBlueprint[];
  npcBehaviorBlueprints: NPCBehaviorBlueprint[];
  agentBehaviorBlueprints: AgentBehaviorBlueprint[];
};

export type StudioPanelProps = EditorPanelBaseProps & {
  gameplayEvents?: GameplayEventBlueprint[];
  defaultSlot?: string;
  defaultBundleId?: string;
  defaultBundleName?: string;
  defaultVersion?: string;
  buildBundle?: (context: StudioPanelBundleContext) => ContentBundle;
  validateBundle?: (bundle: ContentBundle) => ContentBundleValidation;
  onSaveWorld?: (slot: string) => void | Promise<void>;
  onLoadWorld?: (slot: string) => boolean | void | Promise<boolean | void>;
  onExportBundle?: (bundle: ContentBundle) => void | Promise<void>;
};

const downloadJson = (filename: string, data: unknown): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export function StudioPanel({
  gameplayEvents = SEED_GAMEPLAY_EVENTS,
  defaultSlot = 'main',
  defaultBundleId = DEFAULT_BUNDLE_ID,
  defaultBundleName = DEFAULT_BUNDLE_NAME,
  defaultVersion = DEFAULT_VERSION,
  buildBundle: buildBundleProp,
  validateBundle = validateContentBundle,
  onSaveWorld,
  onLoadWorld,
  onExportBundle,
  className = '',
  style,
  children,
}: StudioPanelProps) {
  const runtime = useGaesupRuntime();
  const saveSystem = runtime?.save ?? getSaveSystem();
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const assets = useMemo(
    () => assetIds.map((id) => assetRecords[id]).filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)),
    [assetIds, assetRecords],
  );
  const npcInstances = useNPCStore((state) => state.instances);
  const npcBehaviorBlueprints = useMemo(
    () => Array.from(npcInstances.values()).map((instance) =>
      createNPCBehaviorBlueprintFromInstance(instance, { id: `npc-behavior-${instance.id}` }),
    ),
    [npcInstances],
  );
  const agentBehaviorBlueprints = useMemo(
    () => npcBehaviorBlueprints.map((blueprint) =>
      createAgentBehaviorBlueprintFromNPCBehaviorBlueprint(blueprint, {
        id: `agent-behavior-${blueprint.id}`,
        ownerType: 'npc',
      }),
    ),
    [npcBehaviorBlueprints],
  );

  const [slot, setSlot] = useState(defaultSlot);
  const [bundleId, setBundleId] = useState(defaultBundleId);
  const [bundleName, setBundleName] = useState(defaultBundleName);
  const [version, setVersion] = useState(defaultVersion);
  const [slots, setSlots] = useState<string[]>([]);
  const [status, setStatus] = useState<StudioStatus>({ kind: 'idle', message: '대기 중' });
  const [validation, setValidation] = useState<ContentBundleValidation | null>(null);
  const [showBundleSettings, setShowBundleSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const runTask = async (label: string, task: () => void | Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setStatus({ kind: 'idle', message: `${label} 중입니다.` });
    try {
      await task();
    } catch (error: unknown) {
      logger.error('Studio operation failed', error instanceof Error ? error : String(error));
      setStatus({ kind: 'error', message: `${label}에 실패했습니다. 다시 시도해 주세요.` });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const buildBundle = useCallback((): ContentBundle => {
    const context: StudioPanelBundleContext = {
      assets,
      bundleId,
      bundleName,
      version,
      gameplayEvents,
      npcBehaviorBlueprints,
      agentBehaviorBlueprints,
    };
    if (buildBundleProp) return buildBundleProp(context);
    return createContentBundleFromSaveSystem(saveSystem, assets, {
      id: bundleId,
      name: bundleName,
      version,
      gameplayEvents,
      npcBehaviorBlueprints,
      agentBehaviorBlueprints,
    });
  }, [
    agentBehaviorBlueprints,
    assets,
    buildBundleProp,
    bundleId,
    bundleName,
    gameplayEvents,
    npcBehaviorBlueprints,
    saveSystem,
    version,
  ]);

  const refreshSlots = useCallback(async () => {
    const nextSlots = await saveSystem.list();
    setSlots(nextSlots);
    setStatus({ kind: 'success', message: `저장 슬롯 ${nextSlots.length}개를 불러왔습니다.` });
  }, [saveSystem]);

  const saveWorld = useCallback(async () => {
    if (onSaveWorld) {
      await onSaveWorld(slot);
    } else {
      await saveSystem.save(slot);
    }
    setStatus({ kind: 'success', message: `슬롯 "${slot}" 에 저장했습니다.` });
    try {
      setSlots(await saveSystem.list());
    } catch (error: unknown) {
      logger.error('Saved world but could not refresh slots', error instanceof Error ? error : String(error));
      setStatus({ kind: 'error', message: `슬롯 "${slot}"에 저장했지만 목록을 갱신하지 못했습니다.` });
    }
  }, [onSaveWorld, saveSystem, slot]);

  const loadWorld = useCallback(async () => {
    const loadResult = onLoadWorld
      ? await onLoadWorld(slot)
      : await saveSystem.load(slot);
    const loaded = loadResult === undefined ? true : Boolean(loadResult);
    setStatus({
      kind: loaded ? 'success' : 'error',
      message: loaded ? `슬롯 "${slot}" 을 불러왔습니다.` : `슬롯 "${slot}" 에 저장 데이터가 없습니다.`,
    });
  }, [onLoadWorld, saveSystem, slot]);

  const validateWorld = useCallback(() => {
    const result = validateBundle(buildBundle());
    setValidation(result);
    setStatus({
      kind: result.ok ? 'success' : 'error',
      message: result.ok ? '번들 검증이 통과했습니다.' : `번들 오류 ${result.errors.length}개가 발견되었습니다.`,
    });
  }, [buildBundle, validateBundle]);

  const exportBundle = useCallback(async () => {
    const bundle = buildBundle();
    const result = validateBundle(bundle);
    setValidation(result);
    if (!result.ok) {
      setStatus({ kind: 'error', message: '번들 오류를 먼저 수정한 뒤 내보내세요.' });
      return;
    }
    if (onExportBundle) {
      await onExportBundle(bundle);
    } else {
      downloadJson(`${bundle.id}-${bundle.version}.bundle.json`, bundle);
    }
    setStatus({ kind: 'success', message: '콘텐츠 번들 JSON을 내보냈습니다.' });
  }, [buildBundle, onExportBundle, validateBundle]);

  return (
    <div className={`studio-panel ${className}`} style={style}>
      <section className="studio-panel__section">
        <div className="studio-panel__title">월드 저장 관리</div>
        <div className="studio-panel__hint">작업 중인 월드 상태를 슬롯 단위로 저장하거나 불러옵니다.</div>
        <label className="studio-panel__field">
          <span>슬롯 이름</span>
          <input value={slot} onChange={(event) => setSlot(event.target.value || 'main')} />
        </label>
        <div className="studio-panel__actions">
          <button type="button" disabled={busy} onClick={() => { void runTask('월드 저장', saveWorld); }}>현재 월드 저장</button>
          <button type="button" disabled={busy} onClick={() => { void runTask('월드 불러오기', loadWorld); }}>슬롯 불러오기</button>
          <button type="button" disabled={busy} onClick={() => { void runTask('슬롯 새로고침', refreshSlots); }}>슬롯 새로고침</button>
        </div>
        {slots.length > 0 && (
          <div className="studio-panel__chips">
            {slots.map((saveSlot) => (
              <button key={saveSlot} type="button" onClick={() => setSlot(saveSlot)}>
                {saveSlot}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="studio-panel__section">
        <div className="studio-panel__title">콘텐츠 번들</div>
        <div className="studio-panel__hint">배포용 번들을 검증하고 JSON으로 내보냅니다.</div>
        <button
          type="button"
          onClick={() => setShowBundleSettings((open) => !open)}
          className="studio-panel__ghost"
        >
          {showBundleSettings ? '번들 상세 설정 접기' : '번들 상세 설정 열기'}
        </button>
        {showBundleSettings && (
          <div className="studio-panel__advanced">
            <label className="studio-panel__field">
              <span>번들 ID</span>
              <input value={bundleId} onChange={(event) => setBundleId(event.target.value)} />
            </label>
            <label className="studio-panel__field">
              <span>번들 이름</span>
              <input value={bundleName} onChange={(event) => setBundleName(event.target.value)} />
            </label>
            <label className="studio-panel__field">
              <span>버전</span>
              <input value={version} onChange={(event) => setVersion(event.target.value)} />
            </label>
          </div>
        )}
        <div className="studio-panel__meta">
          에셋 {assets.length}개 · 이벤트 {gameplayEvents.length}개 · NPC 행동 {npcBehaviorBlueprints.length}개 · 에이전트 행동 {agentBehaviorBlueprints.length}개 · 저장 도메인 {Array.from(saveSystem.getBindings()).length}개
        </div>
        <div className="studio-panel__actions">
          <button type="button" disabled={busy} onClick={() => { void runTask('번들 검증', validateWorld); }}>번들 검증</button>
          <button type="button" disabled={busy} onClick={() => { void runTask('번들 내보내기', exportBundle); }}>JSON 내보내기</button>
        </div>
      </section>

      <section className="studio-panel__section">
        <div className="studio-panel__title">상태</div>
        <div role="status" className={`studio-panel__status studio-panel__status--${status.kind}`}>
          {status.message}
        </div>
        {validation && !validation.ok && (
          <ul className="studio-panel__errors">
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </section>
      {children}
    </div>
  );
}
