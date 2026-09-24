import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import type { AvatarEquipmentState, AvatarState } from './core/types';
import { AvatarRuntime, type AvatarRuntimeOptions } from './runtime/AvatarRuntime';
import { useAssetStore } from '../core/assets/stores/assetStore';
import { useEngineFrame } from '../core/runtime/frame';
import { logger } from '../core/utils/logger';

const AvatarContext = createContext<AvatarRuntime | null | undefined>(undefined);
const getCatalogAsset: AvatarRuntimeOptions['getAsset'] = (id) =>
  useAssetStore.getState().getAsset(id);
const EMPTY_STATE: AvatarState = { body: '', equipment: {} };
const subscribeEmpty = () => () => undefined;
const getEmpty = () => EMPTY_STATE;

export function AvatarProvider({
  children,
  getAsset = getCatalogAsset,
  cache,
  avatarId,
}: Partial<AvatarRuntimeOptions> & { children: ReactNode }) {
  const [runtime, setRuntime] = useState<AvatarRuntime | null>(null);
  useEffect(() => {
    const instance = new AvatarRuntime({
      getAsset,
      ...(cache ? { cache } : {}),
      ...(avatarId ? { avatarId } : {}),
    });
    setRuntime(instance);
    return () => instance.dispose();
  }, [getAsset, cache, avatarId]);
  return <AvatarContext.Provider value={runtime}>{children}</AvatarContext.Provider>;
}

export function useAvatar(): AvatarRuntime | null {
  return useContext(AvatarContext) ?? null;
}
export function useAvatarEquipment() {
  const avatar = useAvatar();
  const state = useSyncExternalStore(
    avatar?.subscribe ?? subscribeEmpty,
    avatar?.getSnapshot ?? getEmpty,
    getEmpty,
  );
  return {
    equipment: state.equipment,
    equip: (slot: Parameters<AvatarRuntime['equip']>[0], id: string) => {
      if (!avatar) return Promise.reject(new Error('Avatar is loading'));
      return avatar.equip(slot, id);
    },
    unequip: (slot: Parameters<AvatarRuntime['unequip']>[0]) => {
      if (!avatar) throw new Error('Avatar is loading');
      avatar.unequip(slot);
    },
  };
}

export type AvatarProps = {
  body: string;
  avatarId?: string;
  equipment?: AvatarEquipmentState;
  animation?: string;
  onReady?: (avatar: AvatarRuntime) => void;
  onError?: (error: Error) => void;
};

function AvatarView({ body, equipment, animation, onReady, onError }: AvatarProps) {
  const runtime = useAvatar();
  const callbacks = useRef({ onReady, onError, animation });
  callbacks.current = { onReady, onError, animation };
  const equipmentJson = JSON.stringify(equipment ?? null);
  useEffect(() => {
    if (!runtime) return;
    let active = true;
    const task =
      equipmentJson === 'null'
        ? runtime.setBody(body)
        : runtime.restore({ body, equipment: JSON.parse(equipmentJson) as AvatarEquipmentState });
    void task
      .then(() => {
        if (active) {
          if (callbacks.current.animation) runtime.playAnimation(callbacks.current.animation);
          callbacks.current.onReady?.(runtime);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const failure = error instanceof Error ? error : new Error(String(error));
        if (callbacks.current.onError) callbacks.current.onError(failure);
        else logger.error('Avatar loading failed', failure);
      });
    return () => {
      active = false;
    };
  }, [runtime, body, equipmentJson]);
  useEffect(() => {
    if (runtime && animation && runtime.getAnimationNames().includes(animation))
      runtime.playAnimation(animation);
  }, [runtime, animation]);
  useEngineFrame('animation', (delta) => runtime?.update(delta), { active: runtime !== null, label: 'avatar:runtime' });
  return runtime ? <primitive object={runtime.scene} dispose={null} /> : null;
}

export function Avatar(props: AvatarProps) {
  const runtime = useContext(AvatarContext);
  return runtime !== undefined ? <AvatarView {...props} /> : <StandaloneAvatar {...props} />;
}
function StandaloneAvatar(props: AvatarProps) {
  return (
    <AvatarProvider {...(props.avatarId ? { avatarId: props.avatarId } : {})}>
      <AvatarView {...props} />
    </AvatarProvider>
  );
}
