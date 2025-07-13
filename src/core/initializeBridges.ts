// 브릿지들을 명시적으로 import하여 @DomainBridge 데코레이터가 실행되도록 함
import './motions/bridge/MotionBridge';
import './motions/bridge/PhysicsBridge';
import './world/bridge/WorldBridge';
import './animation/bridge/AnimationBridge';

import { BridgeFactory } from './boilerplate';
import { logger } from './utils/logger';

// 초기화 추적
logger.log('[Core] initializeBridges.ts loaded');

// 모든 도메인 브릿지 생성 또는 가져오기
const domains = BridgeFactory.listDomains();
logger.log('[Core] Registered bridge domains:', domains);

domains.forEach(domain => {
  if (!BridgeFactory.has(domain)) {
    logger.log(`[Core] Creating ${domain} bridge...`);
    const bridge = BridgeFactory.create(domain);
    if (bridge) {
      logger.log(`[Core] ${domain} bridge created successfully`);
    }
  } else {
    logger.log(`[Core] ${domain} bridge already exists`);
  }
});

// 최종 상태 확인
const finalActiveInstances = BridgeFactory.listActiveInstances();
logger.log('[Core] Active instances after creation:', finalActiveInstances);
logger.log('[Core] Total instance count:', BridgeFactory.getInstanceCount()); 