import { RenderGraph } from '../core/RenderGraph';

type TestContext = {
  calls: string[];
};

describe('RenderGraph', () => {
  test('리소스를 쓰는 패스가 읽는 패스보다 먼저 실행된다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({
      id: 'tonemap',
      reads: ['bloom'],
      writes: ['backbuffer'],
      execute: (ctx) => ctx.calls.push('tonemap'),
    });
    graph.addPass({
      id: 'bloom',
      reads: ['scene'],
      writes: ['bloom'],
      execute: (ctx) => ctx.calls.push('bloom'),
    });
    graph.addPass({
      id: 'scene',
      writes: ['scene'],
      execute: (ctx) => ctx.calls.push('scene'),
    });
    const context: TestContext = { calls: [] };
    graph.execute(context);
    expect(context.calls).toEqual(['scene', 'bloom', 'tonemap']);
  });

  test('compile은 실행 순서의 패스 id 목록을 반환한다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({ id: 'post', reads: ['color'], execute: () => undefined });
    graph.addPass({ id: 'forward', writes: ['color'], execute: () => undefined });
    expect(graph.compile()).toEqual(['forward', 'post']);
  });

  test('기록되지 않은 리소스를 읽으면 에러가 된다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({ id: 'post', reads: ['missing'], execute: () => undefined });
    expect(() => graph.compile()).toThrow('unwritten resource');
  });

  test('같은 리소스에 두 패스가 쓰면 에러가 된다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({ id: 'a', writes: ['color'], execute: () => undefined });
    graph.addPass({ id: 'b', writes: ['color'], execute: () => undefined });
    expect(() => graph.compile()).toThrow('written by both');
  });

  test('패스 순환 의존은 에러가 된다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({ id: 'a', reads: ['rb'], writes: ['ra'], execute: () => undefined });
    graph.addPass({ id: 'b', reads: ['ra'], writes: ['rb'], execute: () => undefined });
    expect(() => graph.compile()).toThrow('cycle');
  });

  test('중복 패스 id는 거부된다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({ id: 'a', execute: () => undefined });
    expect(() => graph.addPass({ id: 'a', execute: () => undefined })).toThrow(
      '[RenderGraph Error]',
    );
  });

  test('패스 제거 후 재컴파일된다', () => {
    const graph = new RenderGraph<TestContext>();
    graph.addPass({ id: 'scene', writes: ['scene'], execute: (ctx) => ctx.calls.push('scene') });
    graph.addPass({
      id: 'debug',
      reads: ['scene'],
      execute: (ctx) => ctx.calls.push('debug'),
    });
    const context: TestContext = { calls: [] };
    graph.execute(context);
    expect(graph.removePass('debug')).toBe(true);
    graph.execute(context);
    expect(context.calls).toEqual(['scene', 'debug', 'scene']);
  });
});
