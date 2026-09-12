import {
  compactVisible,
  cullSpheres,
  entityIndexOf,
  extractFrustumPlanes,
  FRUSTUM_PLANES_LENGTH,
  NextWorld,
  packInstanceMatrices,
} from 'gaesup-world/next';

const INSTANCE_COUNT = 10000;
const FIELD_RADIUS = 120;
const FIELD_HEIGHT = 10;
const SPHERE_RADIUS = 1.2;
const SCENE_SEED = 42;
const RANDOM_MULTIPLIER = 1664525;
const RANDOM_INCREMENT = 1013904223;
const UINT32_RANGE = 0x100000000;

type CullRequest = {
  type: 'cull';
  requestId: number;
  viewProjection: Float32Array;
  clipDepthZeroToOne: boolean;
  matrixBuffer: ArrayBuffer;
};

function createWorld(): NextWorld {
  let seed = SCENE_SEED;
  const random = () => {
    seed = (Math.imul(seed, RANDOM_MULTIPLIER) + RANDOM_INCREMENT) >>> 0;
    return seed / UINT32_RANGE;
  };
  const world = new NextWorld({ capacity: INSTANCE_COUNT });
  for (let slot = 0; slot < INSTANCE_COUNT; slot += 1) {
    const index = entityIndexOf(world.createEntity());
    world.transforms.setPosition(
      index,
      (random() * 2 - 1) * FIELD_RADIUS,
      random() * FIELD_HEIGHT,
      (random() * 2 - 1) * FIELD_RADIUS,
    );
  }
  return world;
}

const world = createWorld();
const planes = new Float32Array(FRUSTUM_PLANES_LENGTH);
const visibility = new Uint8Array(INSTANCE_COUNT);
const indices = new Uint32Array(INSTANCE_COUNT);

self.onmessage = (event: MessageEvent<CullRequest>) => {
  const request = event.data;
  if (request.type !== 'cull') return;
  const startedAt = performance.now();
  extractFrustumPlanes(request.viewProjection, planes, request.clipDepthZeroToOne);
  cullSpheres(planes, world.transforms.positions, SPHERE_RADIUS, world.entityCount, visibility);
  const visibleCount = compactVisible(visibility, world.entityCount, indices);
  const matrices = new Float32Array(request.matrixBuffer);
  packInstanceMatrices(world.transforms, indices, visibleCount, matrices);
  const computeMs = performance.now() - startedAt;
  self.postMessage(
    {
      type: 'result',
      requestId: request.requestId,
      visibleCount,
      computeMs,
      matrixBuffer: request.matrixBuffer,
    },
    { transfer: [request.matrixBuffer] },
  );
};
