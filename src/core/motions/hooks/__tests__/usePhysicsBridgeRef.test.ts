/**
 * usePhysicsBridge 훅이 매 프레임마다 calcProp / input 객체를 새로 만들지 않도록
 * ref 로 재사용하는 구조를 강제한다. 정적 소스 검사로 회귀를 방지한다.
 */
import * as fs from 'fs';
import * as path from 'path';

const FILE = path.resolve(__dirname, '../usePhysicsBridge.ts');

function read(): string {
  return fs.readFileSync(FILE, 'utf8');
}

describe('usePhysicsBridge calcProp 재사용', () => {
  test('executePhysics 내부에서 calcProp 객체 리터럴이 매 프레임 생성되지 않는다', () => {
    const src = read();
    expect(src).not.toMatch(/const\s+calcProp\s*:\s*PhysicsCalcProps\s*=\s*\{/);
  });

  test('calcProp 재사용을 위한 ref 가 존재한다', () => {
    const src = read();
    expect(src).toMatch(/calcPropRef\s*=\s*useRef/);
  });

  test('input 상태도 ref 로 재사용된다', () => {
    const src = read();
    expect(src).toMatch(/inputRef\s*=\s*useRef/);
  });
});
