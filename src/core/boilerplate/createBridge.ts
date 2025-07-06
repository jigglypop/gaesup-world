import { AbstractBridge } from './AbstractBridge';
import { IDisposable } from './types';

/**
 * createBridge는 반복적인 ConcreteBridge 클래스를 간소화하기 위한 팩토리 함수다.
 * buildEngine / executeCommand / createSnapshot 구현만 주입하면 완전한 브릿지 클래스를 반환한다.
 */
export function createBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
>(
  params: {
    buildEngine: (id: string, ...args: any[]) => EngineType | null;
    executeCommand: (engine: EngineType, command: CommandType, id: string) => void;
    createSnapshot: (engine: EngineType, id: string) => SnapshotType | null;
  },
) {
  return class GeneratedBridge extends AbstractBridge<
    EngineType,
    SnapshotType,
    CommandType
  > {
    protected buildEngine(id: string, ...args: any[]): EngineType | null {
      return params.buildEngine(id, ...args);
    }

    protected executeCommand(
      engine: EngineType,
      command: CommandType,
      id: string,
    ): void {
      params.executeCommand(engine, command, id);
    }

    protected createSnapshot(
      engine: EngineType,
      id: string,
    ): SnapshotType | null {
      return params.createSnapshot(engine, id);
    }
  };
} 