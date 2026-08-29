import fs from 'node:fs';
import path from 'node:path';

import { DEVELOPER_ROUTES, EXAMPLE_ROUTES, PRODUCT_ROUTES, ROUTE_ALIASES } from '../exampleRoutes';

describe('examples route manifest', () => {
  it('제품 경로를 시나리오 진입점으로 제공한다', () => {
    expect(PRODUCT_ROUTES.map((route) => route.path)).toEqual([
      '/world',
      '/creator',
      '/multiplayer',
      '/assets',
      '/performance',
    ]);
  });

  it('개발자 경로를 기본 제품 경로와 분리한다', () => {
    expect(DEVELOPER_ROUTES.every((route) => route.audience === 'developer')).toBe(true);
    expect(DEVELOPER_ROUTES.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/examples', '/minimal', '/showcase', '/next', '/admin-test']),
    );
  });

  it('모든 경로는 중복 없이 등록된다', () => {
    const paths = EXAMPLE_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('경로 명세와 앱 라우트 선언이 양방향으로 일치한다', () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, '../../App.tsx'), 'utf8');
    const appPaths = Array.from(appSource.matchAll(/<Route\s+path="([^"]+)"/g), ([, routePath]) =>
      String(routePath),
    );
    const normalizePath = (routePath: string) => routePath.replace(/\/\*$/, '');
    const normalizedAppPaths = appPaths.map(normalizePath);
    const manifestPaths = [...EXAMPLE_ROUTES.map((route) => route.path), ...ROUTE_ALIASES];
    expect(new Set(normalizedAppPaths)).toEqual(new Set(manifestPaths));
  });
});
