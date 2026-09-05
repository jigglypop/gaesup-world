import { TaskGraph } from '../core/TaskGraph';

describe('TaskGraph', () => {
  test('페이즈 순서대로 실행된다', () => {
    const graph = new TaskGraph();
    const calls: string[] = [];
    graph.add({ id: 'draw', phase: 'render', run: () => calls.push('draw') });
    graph.add({ id: 'step', phase: 'physics', run: () => calls.push('step') });
    graph.add({ id: 'poll', phase: 'input', run: () => calls.push('poll') });
    graph.add({ id: 'ai', phase: 'simulate', run: () => calls.push('ai') });
    graph.run(16);
    expect(calls).toEqual(['poll', 'ai', 'step', 'draw']);
  });

  test('같은 페이즈 안에서는 의존성 위상 순서를 지킨다', () => {
    const graph = new TaskGraph();
    const calls: string[] = [];
    graph.add({ id: 'b', phase: 'simulate', deps: ['a'], run: () => calls.push('b') });
    graph.add({ id: 'c', phase: 'simulate', deps: ['b'], run: () => calls.push('c') });
    graph.add({ id: 'a', phase: 'simulate', run: () => calls.push('a') });
    graph.run(16);
    expect(calls).toEqual(['a', 'b', 'c']);
  });

  test('run은 deltaTime을 각 태스크에 전달한다', () => {
    const graph = new TaskGraph();
    const received: number[] = [];
    graph.add({ id: 'a', phase: 'simulate', run: (dt) => received.push(dt) });
    graph.run(33);
    expect(received).toEqual([33]);
  });

  test('중복 태스크 id는 거부된다', () => {
    const graph = new TaskGraph();
    graph.add({ id: 'a', phase: 'simulate', run: () => undefined });
    expect(() => graph.add({ id: 'a', phase: 'render', run: () => undefined })).toThrow(
      '[TaskGraph Error]',
    );
  });

  test('순환 의존은 컴파일 시 에러가 된다', () => {
    const graph = new TaskGraph();
    graph.add({ id: 'a', phase: 'simulate', deps: ['b'], run: () => undefined });
    graph.add({ id: 'b', phase: 'simulate', deps: ['a'], run: () => undefined });
    expect(() => graph.compile()).toThrow('dependency cycle');
  });

  test('알 수 없는 의존성은 에러가 된다', () => {
    const graph = new TaskGraph();
    graph.add({ id: 'a', phase: 'simulate', deps: ['missing'], run: () => undefined });
    expect(() => graph.compile()).toThrow('unknown dependency');
  });

  test('이후 페이즈 태스크에 대한 의존은 거부된다', () => {
    const graph = new TaskGraph();
    graph.add({ id: 'early', phase: 'input', deps: ['late'], run: () => undefined });
    graph.add({ id: 'late', phase: 'render', run: () => undefined });
    expect(() => graph.compile()).toThrow('later phase');
  });

  test('태스크 제거 후에는 실행되지 않는다', () => {
    const graph = new TaskGraph();
    const calls: string[] = [];
    graph.add({ id: 'a', phase: 'simulate', run: () => calls.push('a') });
    graph.add({ id: 'b', phase: 'simulate', run: () => calls.push('b') });
    graph.run(16);
    expect(graph.remove('a')).toBe(true);
    graph.run(16);
    expect(calls).toEqual(['a', 'b', 'b']);
  });
});
