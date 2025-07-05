import { useMemo, RefObject, useCallback, useRef } from 'react';
import { AbstractBridge } from './AbstractBridge';
import { ManagedEntity} from './ManagedEntity';
import { useBaseLifecycle } from './useBaseLifecycle';
import { useBaseFrame } from './useBaseFrame';
import { IDisposable, UseManagedEntityOptions } from './types';


/**
 * 엔티티 관리에 필요한 모든 것을 생성하고 연결하는 팩토리 훅.
 *
 * @template EngineType - 관리할 엔진 또는 ref 래퍼의 타입.
 * @template SnapshotType - 상태 스냅샷의 타입.
 * @template CommandType - 실행할 명령의 타입.
 *
 * @param bridge - 사용할 Bridge 인스턴스.
 * @param id - 엔티티 ID.
 * @param ref - 관리할 엔진/ref 객체에 대한 RefObject.
 * @param options - 선택적 설정.
 * @returns {ManagedEntity | null} - 생성된 ManagedEntity 인스턴스.
 */
export function useManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  ref: RefObject<EngineType>,
  options: UseManagedEntityOptions = {}
): ManagedEntity<EngineType, SnapshotType, CommandType> | null {
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const managedEntity = useMemo(() => {
        if (!bridge || !ref.current) return null;
        
        const entity = new ManagedEntity(bridge, id, ref.current, options);
        
        // 초기화 콜백 실행
        if (optionsRef.current.onInit) {
            optionsRef.current.onInit(entity);
        }
        
        return entity;
    }, [bridge, id, ref]);

    // 커스텀 프레임 콜백
    const frameCallback = useCallback(() => {
        if (optionsRef.current.frameCallback) {
            optionsRef.current.frameCallback();
        }
    }, []);

    // 생명주기 관리
    if (!options.skipLifecycle) {
        useBaseLifecycle(bridge, id, managedEntity?.engine || null);
    }

    // 프레임 업데이트
    if (!options.skipFrame) {
        useBaseFrame(bridge, id, frameCallback);
    }

    return managedEntity;
}

/**
 * 여러 엔티티를 한 번에 관리하는 훅.
 */
export function useManagedEntities<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  entities: Array<{
    id: string;
    ref: RefObject<EngineType>;
    options?: UseManagedEntityOptions;
  }>
): Array<ManagedEntity<EngineType, SnapshotType, CommandType> | null> {
    return entities.map(({ id, ref, options }) => 
        useManagedEntity(bridge, id, ref, options)
    );
} 