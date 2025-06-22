export const CAMERA_PRESETS = {
  firstPerson: {
    yDistance: 1.6,
    fov: 75,
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.05 },
  },
  thirdPerson: {
    xDistance: 15,
    yDistance: 8,
    zDistance: 15,
    enableCollision: true,
    smoothing: { position: 1, rotation: 0.1, fov: 0.1 },
    bounds: { minY: 2, maxY: 50 },
  },
  chase: {
    xDistance: 20,
    yDistance: 10,
    zDistance: 20,
    smoothing: { position: 0.1, rotation: 0.15, fov: 0.1 },
  },
  topDown: {
    yDistance: 25,
    xDistance: 0,
    zDistance: 0,
    fov: 60,
    bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
  },
  sideScroll: {
    xDistance: -20,
    yDistance: 5,
    zDistance: 0,
    bounds: { minX: -50, maxX: 50, minY: 2, maxY: 30 },
  },
};

export const CAMERA_DESCRIPTIONS = {
  firstPerson: '1인칭 시점',
  thirdPerson: '3인칭 카메라',
  chase: '추적 카메라',
  topDown: '탑뷰 카메라',
  sideScroll: '사이드뷰 카메라',
};
