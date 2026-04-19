/**
 * 조건부 훅 위반 회귀 방지 테스트.
 *
 * 목적: NPCPartMesh / ClothBatchGroup 안에서 조건부로 useGLTF / useTexture 를
 * 호출하던 기존 구조가 React Hooks 규칙을 위반했음. 분기 컴포넌트 분리 후에는
 * 부모가 분기마다 다른 자식 컴포넌트를 렌더하므로 자식 내부의 훅 호출 순서가
 * 매 렌더 동일해야 한다. 본 테스트는 소스 정적 검사로 회귀를 방지한다.
 */
import * as fs from 'fs';
import * as path from 'path';

const NPC_FILE = path.resolve(__dirname, '../npc/components/NPCInstance/index.tsx');
const FLAG_FILE = path.resolve(__dirname, '../building/components/mesh/flag/index.tsx');

function readFile(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function extractFunctionBody(source: string, signaturePattern: RegExp): string {
  const match = source.match(signaturePattern);
  if (!match) {
    throw new Error(`함수 시그니처를 찾지 못했습니다: ${signaturePattern}`);
  }
  const start = source.indexOf('{', match.index!);
  if (start < 0) throw new Error('함수 본문 시작 중괄호를 찾을 수 없습니다');
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error('함수 본문 종료 중괄호를 찾을 수 없습니다');
}

describe('조건부 훅 위반 회귀 방지', () => {
  test('NPCPartMesh 안에서 useGLTF 가 직접 호출되지 않는다', () => {
    const src = readFile(NPC_FILE);
    const body = extractFunctionBody(src, /function\s+NPCPartMesh\s*\(/);
    expect(body).not.toMatch(/useGLTF\s*\(/);
  });

  test('NPCPartGltfMesh 와 NPCPartFallbackMesh 가 분리되어 존재한다', () => {
    const src = readFile(NPC_FILE);
    expect(src).toMatch(/function\s+NPCPartGltfMesh\s*\(/);
    expect(src).toMatch(/function\s+NPCPartFallbackMesh\s*\(/);
  });

  test('ClothBatchGroup 안에서 useTexture 가 직접 호출되지 않는다', () => {
    const src = readFile(FLAG_FILE);
    const body = extractFunctionBody(src, /function\s+ClothBatchGroup\s*\(/);
    expect(body).not.toMatch(/useTexture\s*\(/);
  });

  test('ClothBatchTextured 와 ClothBatchFallback 이 분리되어 존재한다', () => {
    const src = readFile(FLAG_FILE);
    expect(src).toMatch(/function\s+ClothBatchTextured\s*\(/);
    expect(src).toMatch(/function\s+ClothBatchFallback\s*\(/);
  });
});
