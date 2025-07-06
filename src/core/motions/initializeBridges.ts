// 브릿지들을 명시적으로 import하여 @DomainBridge 데코레이터가 실행되도록 함
import './bridge/MotionBridge';
import './bridge/PhysicsBridge';
import { BridgeFactory } from '../boilerplate';
import { logger } from '../utils/logger';

// 초기화 추적
logger.log('[Motions] initializeBridges.ts loaded');

// 등록된 도메인 확인
const registeredDomains = BridgeFactory.listDomains();
logger.log('[Motions] Registered domains:', registeredDomains);

// 활성화된 인스턴스 확인
const activeInstances = BridgeFactory.listActiveInstances();
logger.log('[Motions] Active instances before creation:', activeInstances);

// Physics 브릿지 생성 또는 가져오기
if (!BridgeFactory.has('physics')) {
  logger.log('[Motions] Creating physics bridge...');
  const physicsBridge = BridgeFactory.create('physics');
  if (physicsBridge) {
    logger.log('[Motions] Physics bridge created successfully');
  }
} else {
  logger.log('[Motions] Physics bridge already exists');
}

// Motion 브릿지 생성 또는 가져오기
if (!BridgeFactory.has('motion')) {
  logger.log('[Motions] Creating motion bridge...');
  const motionBridge = BridgeFactory.create('motion');
  if (motionBridge) {
    logger.log('[Motions] Motion bridge created successfully');
  }
} else {
  logger.log('[Motions] Motion bridge already exists');
}

// 최종 상태 확인
const finalActiveInstances = BridgeFactory.listActiveInstances();
logger.log('[Motions] Active instances after creation:', finalActiveInstances);
logger.log('[Motions] Total instance count:', BridgeFactory.getInstanceCount()); 