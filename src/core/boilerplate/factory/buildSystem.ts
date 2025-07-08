import { BaseSystem } from '../entity/BaseSystem';
import { RuntimeManagerDecorator } from '../decorators/RuntimeManagerDecorator';
import { LoggingDecorator, LoggingOptions } from '../decorators/LoggingDecorator';
import { SystemDecorator } from '../decorators/SystemDecorator';

export interface SystemConfig {
  enableLogging?: boolean;
  loggingOptions?: LoggingOptions;
  enableRuntime?: boolean;
  [key: string]: any;
}

/**
 * 시스템을 빌드하고 필요한 데코레이터들을 적용합니다
 * @param SystemClass - 기본 시스템 클래스
 * @param config - 시스템 설정
 * @returns 데코레이터가 적용된 시스템 인스턴스
 */
export async function buildSystem<T extends BaseSystem>(
  SystemClass: new (...args: any[]) => T,
  config: SystemConfig = {},
  ...systemArgs: any[]
): Promise<BaseSystem> {
  // 기본 시스템 인스턴스 생성
  let system: BaseSystem = new SystemClass(...systemArgs);

  // 로깅 데코레이터 적용
  if (config.enableLogging) {
    system = new LoggingDecorator(system, config.loggingOptions || {});
  }

  // 런타임 매니저 적용 (기본값: true)
  if (config.enableRuntime !== false) {
    system = new RuntimeManagerDecorator(system);
  }

  // 시스템 초기화
  await system.init();

  return system;
} 