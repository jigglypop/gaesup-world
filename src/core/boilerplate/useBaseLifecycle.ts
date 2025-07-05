import { useEffect, useRef } from 'react';
import { AbstractBridge } from './AbstractBridge';
import { IDisposable, UseBaseLifecycleOptions } from './types';

/**
 * 엔티티의 생명주기에 맞춰 Bridge에 등록/해제하는 로직을 캡슐화한 제네릭 훅.
 * @param bridge - 사용할 Bridge 인스턴스.
 * @param id - 엔티티 ID.
 * @param engine - 관리할 엔진 또는 ref 래퍼 객체.
 * @param options - 생명주기 옵션.
 */
export function useBaseLifecycle<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  engine: EngineType | null,
  options: UseBaseLifecycleOptions<EngineType> = {}
) {
  const { 
    onRegister, 
    onUnregister, 
    dependencies = [],
    enabled = true 
  } = options;
  
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!bridge || !engine || !enabled) return;

    // 브릿지에 등록
    bridge.register(id, engine);

    // 등록 콜백 실행
    if (onRegister) {
      const cleanup = onRegister(engine);
      if (typeof cleanup === 'function') {
        cleanupRef.current = cleanup;
      }
    }

    // 클린업 함수
    return () => {
      // 사용자 정의 클린업 실행
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // 해제 콜백 실행
      if (onUnregister) {
        onUnregister(engine);
      }

      // 브릿지에서 해제
      bridge.unregister(id);
    };
  }, [bridge, id, engine, enabled, ...dependencies]);
}

/**
 * 지연된 생명주기 관리를 위한 훅.
 * 엔진이 준비될 때까지 등록을 지연시킵니다.
 */
export function useDeferredLifecycle<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  engineGetter: () => EngineType | null,
  options?: UseBaseLifecycleOptions<EngineType>
) {
  const engine = engineGetter();
  useBaseLifecycle(bridge, id, engine, options);
}

/**
 * 여러 엔진을 한 번에 관리하는 생명주기 훅.
 */
export function useMultipleLifecycles<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  engines: Array<{ id: string; engine: EngineType | null; options?: UseBaseLifecycleOptions<EngineType> }>
) {
  engines.forEach(({ id, engine, options }) => {
    useBaseLifecycle(bridge, id, engine, options);
  });
} 