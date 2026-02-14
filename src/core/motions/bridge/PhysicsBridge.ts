import { PhysicsConfigType } from '@/core/stores/slices/physics/types';
import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { LogSnapshot, ValidateCommand, CacheSnapshot } from '@core/boilerplate';

import { PhysicsSystem } from '../core/system/PhysicsSystem';
import { PhysicsUpdateArgs } from '../core/system/PhysicsSystem';

export type PhysicsBridgeEntity = {
  system: PhysicsSystem;
  dispose: () => void;
};

export type PhysicsCommand = {
  type: 'updateConfig';
  data: Partial<PhysicsConfigType>;
};

export type PhysicsSnapshot = ReturnType<PhysicsSystem['getState']> & {
  metrics: ReturnType<PhysicsSystem['getMetrics']>;
};

@DomainBridge('physics')
@EnableEventLog()
export class PhysicsBridge extends CoreBridge<PhysicsBridgeEntity, PhysicsSnapshot, PhysicsCommand> {
  protected buildEngine(_: string, config: PhysicsConfigType): PhysicsBridgeEntity | null {
    void _;
    const system = new PhysicsSystem(config);
    return { system, dispose: () => system.dispose() };
  }

  @ValidateCommand()
  protected executeCommand(entity: PhysicsBridgeEntity, command: PhysicsCommand, _id: string): void {
    void _id;
    switch (command.type) {
      case 'updateConfig':
        entity.system.updateConfig(command.data);
        break;
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16) // 60fps 캐싱
  protected createSnapshot(entity: PhysicsBridgeEntity): PhysicsSnapshot {
    return {
      ...entity.system.getState(),
      metrics: { ...entity.system.getMetrics() },
    };
  }

  updateEntity(id: string, args: PhysicsUpdateArgs): void {
    const entity = this.getEngine(id);
    if (!entity) return;
    entity.system.updateWithArgs(args);
    this.notifyListeners(id);
  }
} 