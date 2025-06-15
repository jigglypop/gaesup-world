export const S3 = 'https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf';
export const CHARACTER_URL = 'gltf/ally_body.glb';
export const AIRPLANE_URL = S3 + '/gaebird.glb';
export const VEHICLE_URL = S3 + '/gorani.glb';
export const PLATFORMS = [
  {
    name: '발판 A',
    position: [40, 2, 0],
    size: [8, 1, 8],
    color: '#8B4513',
    type: '기본',
    label: 'A',
  },
  {
    name: '발판 B',
    position: [-40, 3, 20],
    size: [6, 1, 6],
    color: '#8B4513',
    type: '기본',
    label: 'B',
  },
  {
    name: '발판 C',
    position: [0, 4, 60],
    size: [10, 1, 6],
    color: '#8B4513',
    type: '긴 발판',
    label: 'C',
  },
  {
    name: '발판 D',
    position: [80, 5, -40],
    size: [8, 1, 8],
    color: '#8B4513',
    type: '높은 발판',
    label: 'D',
  },
  {
    name: '계단 1',
    position: [100, 1, 20],
    size: [4, 1, 4],
    color: '#D2691E',
    type: '계단',
    label: '1',
  },
  {
    name: '계단 2',
    position: [100, 2, 30],
    size: [4, 1, 4],
    color: '#D2691E',
    type: '계단',
    label: '2',
  },
  {
    name: '계단 3',
    position: [100, 3, 40],
    size: [4, 1, 4],
    color: '#D2691E',
    type: '계단',
    label: '3',
  },
  {
    name: '계단 4',
    position: [100, 4, 50],
    size: [4, 1, 4],
    color: '#D2691E',
    type: '계단',
    label: '4',
  },
];
export const TABS = [
  { id: 'controls', label: '조작법', emoji: '' },
  { id: 'features', label: '기능', emoji: '' },
  { id: 'locations', label: '위치', emoji: '' },
];
export const TELEPORT_POINTS = [
  { name: '시작점', position: [0, 2, 0] },
  { name: '발판 A', position: [40, 3, 0] },
  { name: '발판 B', position: [-40, 4, 20] },
  { name: '계단', position: [100, 2, 20] },
  { name: '차량', position: [-70, 3, 30] },
  { name: '비행기1', position: [70, 3, 40] },
  { name: '비행기2', position: [-30, 3, 80] },
];
