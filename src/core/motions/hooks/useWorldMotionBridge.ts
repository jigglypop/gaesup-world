import { useMemo } from 'react';

import { BridgeFactory } from '../../boilerplate';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/context';
import type { MotionBridge } from '../bridge/MotionBridge';

export function useWorldMotionBridge(): MotionBridge | null {
  const runtime = useGaesupRuntime(); const revision = useGaesupRuntimeRevision();
  return useMemo(() => runtime ? (runtime.isActive() ? runtime.motionBridge : null)
    : BridgeFactory.getOrCreate<MotionBridge>('motion'), [runtime, revision]);
}
