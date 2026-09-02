import type { ExampleRoute } from './types';

export const EXAMPLE_ROUTES: ExampleRoute[] = [
  {
    path: '/world',
    label: '월드',
    description: 'Explore the playable Cozy House world with movement, interaction and HUD.',
    category: '체험',
    audience: 'product',
  },
  {
    path: '/creator',
    label: '크리에이터',
    description: 'Build and edit the same world used by the runtime.',
    category: '제작',
    audience: 'product',
  },
  {
    path: '/multiplayer',
    label: '멀티플레이',
    description: 'Validate player presence, rooms and network integration.',
    category: '연결',
    audience: 'product',
  },
  {
    path: '/assets',
    label: '에셋',
    description: 'Inspect the public asset catalog and GLB-ready records.',
    category: '저작',
    audience: 'product',
  },
  {
    path: '/performance',
    label: '성능',
    description: 'Compare CPU reference culling with the WebGPU compute path.',
    category: '측정',
    audience: 'product',
  },
  {
    path: '/examples',
    label: '예제 카탈로그',
    description: 'Browse every public integration and compatibility route.',
    category: '개발자',
    audience: 'developer',
  },
  {
    path: '/minimal',
    label: '최소 통합',
    description: 'Smallest public API integration.',
    category: '개발자',
    audience: 'developer',
  },
  {
    path: '/edit',
    label: '레거시 에디터',
    description: 'Compatibility alias for the world editor.',
    category: '호환',
    audience: 'developer',
  },
  {
    path: '/edit/npc',
    label: 'NPC 에디터',
    description: 'NPC editing panel in the world shell.',
    category: '개발자',
    audience: 'developer',
  },
  {
    path: '/showcase',
    label: '진단 쇼케이스',
    description: 'Combined feature showcase with editor and diagnostics enabled.',
    category: '진단',
    audience: 'developer',
  },
  {
    path: '/building',
    label: '건축 에디터',
    description: 'Building placement and wall editing integration.',
    category: '개발자',
    audience: 'developer',
  },
  {
    path: '/blueprints',
    label: '블루프린트 에디터',
    description: 'Blueprint and gameplay content integration.',
    category: '개발자',
    audience: 'developer',
  },
  {
    path: '/network',
    label: '레거시 네트워크',
    description: 'Compatibility alias for multiplayer validation.',
    category: '호환',
    audience: 'developer',
  },
  {
    path: '/next',
    label: '넥스트 코어',
    description: 'Direct data-oriented CPU and WebGPU experiment route.',
    category: '실험',
    audience: 'developer',
  },
  {
    path: '/admin',
    label: '관리자 셸',
    description: 'Admin shell around the world editor.',
    category: '개발자',
    audience: 'developer',
  },
  {
    path: '/admin-test',
    label: '관리자 패키지 테스트',
    description: 'Standalone admin package integration.',
    category: '진단',
    audience: 'developer',
  },
];

export const PRODUCT_ROUTES = EXAMPLE_ROUTES.filter((route) => route.audience === 'product');
export const DEVELOPER_ROUTES = EXAMPLE_ROUTES.filter((route) => route.audience === 'developer');
export const ROUTE_ALIASES = ['/', '/index.html', '*'] as const;
