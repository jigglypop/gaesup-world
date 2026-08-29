import type { ExampleRoute } from './types';

export const EXAMPLE_ROUTES: ExampleRoute[] = [
  {
    path: '/world',
    label: 'World',
    description: 'Explore the playable Cozy House world with movement, interaction and HUD.',
    category: 'Experience',
    audience: 'product',
  },
  {
    path: '/creator',
    label: 'Creator',
    description: 'Build and edit the same world used by the runtime.',
    category: 'Create',
    audience: 'product',
  },
  {
    path: '/multiplayer',
    label: 'Multiplayer',
    description: 'Validate player presence, rooms and network integration.',
    category: 'Connect',
    audience: 'product',
  },
  {
    path: '/assets',
    label: 'Assets',
    description: 'Inspect the public asset catalog and GLB-ready records.',
    category: 'Author',
    audience: 'product',
  },
  {
    path: '/performance',
    label: 'Performance',
    description: 'Compare CPU reference culling with the WebGPU compute path.',
    category: 'Measure',
    audience: 'product',
  },
  {
    path: '/examples',
    label: 'Example Catalog',
    description: 'Browse every public integration and compatibility route.',
    category: 'Developer',
    audience: 'developer',
  },
  {
    path: '/minimal',
    label: 'Minimal Integration',
    description: 'Smallest public API integration.',
    category: 'Developer',
    audience: 'developer',
  },
  {
    path: '/edit',
    label: 'Legacy Editor Route',
    description: 'Compatibility alias for the world editor.',
    category: 'Compatibility',
    audience: 'developer',
  },
  {
    path: '/edit/npc',
    label: 'NPC Editor',
    description: 'NPC editing panel in the world shell.',
    category: 'Developer',
    audience: 'developer',
  },
  {
    path: '/showcase',
    label: 'Diagnostics Showcase',
    description: 'Combined feature showcase with editor and diagnostics enabled.',
    category: 'Diagnostics',
    audience: 'developer',
  },
  {
    path: '/building',
    label: 'Building Editor',
    description: 'Building placement and wall editing integration.',
    category: 'Developer',
    audience: 'developer',
  },
  {
    path: '/blueprints',
    label: 'Blueprint Editor',
    description: 'Blueprint and gameplay content integration.',
    category: 'Developer',
    audience: 'developer',
  },
  {
    path: '/network',
    label: 'Legacy Network Route',
    description: 'Compatibility alias for multiplayer validation.',
    category: 'Compatibility',
    audience: 'developer',
  },
  {
    path: '/next',
    label: 'Next Core',
    description: 'Direct data-oriented CPU and WebGPU experiment route.',
    category: 'Experimental',
    audience: 'developer',
  },
  {
    path: '/admin',
    label: 'Admin Shell',
    description: 'Admin shell around the world editor.',
    category: 'Developer',
    audience: 'developer',
  },
  {
    path: '/admin-test',
    label: 'Admin Package Test',
    description: 'Standalone admin package integration.',
    category: 'Diagnostics',
    audience: 'developer',
  },
];

export const PRODUCT_ROUTES = EXAMPLE_ROUTES.filter((route) => route.audience === 'product');
export const DEVELOPER_ROUTES = EXAMPLE_ROUTES.filter((route) => route.audience === 'developer');
export const ROUTE_ALIASES = ['/', '/index.html', '*'] as const;
