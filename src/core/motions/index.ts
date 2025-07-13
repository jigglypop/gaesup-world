import { BridgeFactory } from '@core/boilerplate';
import { logger } from '@core/utils/logger';

// 최종 상태 확인
const finalActiveInstances = BridgeFactory.listActiveInstances();
logger.log('[Motions] Active instances:', finalActiveInstances);
logger.log('[Motions] Total instance count:', BridgeFactory.getInstanceCount());

export * from './bridge';
export * from './controller';
export * from './core';
export * from './entities';
export * from './hooks';
export * from './types';
export * from './ui';
