import { REVISION } from 'three';

import { GPU_BATCH_REVISIONS, isGpuBatchRevision } from '../gpuBatchRevision';

test('GPU batching은 private renderer 내부를 검증한 three revision에서만 켜진다', () => {
  expect([...GPU_BATCH_REVISIONS]).toEqual(['185', '186']);
  expect(isGpuBatchRevision('184')).toBe(false);
  expect(isGpuBatchRevision('187')).toBe(false);
  expect(isGpuBatchRevision()).toBe(GPU_BATCH_REVISIONS.has(REVISION));
});

test('개발 의존성의 three revision은 GPU batching 검증 목록에 포함된다', () => {
  expect(isGpuBatchRevision()).toBe(true);
});
