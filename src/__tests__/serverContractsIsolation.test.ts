import { spawnSync } from 'child_process';
import * as path from 'path';

describe('server-contracts 엔트리 격리', () => {
  test('React, Zustand, React Three 모듈을 런타임 의존으로 끌어오지 않는다', () => {
    const script = path.resolve(__dirname, '../../scripts/check-entry-isolation.cjs');
    const result = spawnSync(process.execPath, [script, 'src/server-contracts.ts'], {
      cwd: path.resolve(__dirname, '../..'),
      encoding: 'utf8',
    });
    expect(result.stdout).toContain('0 framework imports');
    expect(result.status).toBe(0);
  });
});
