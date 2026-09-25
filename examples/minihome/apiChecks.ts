import { createMinihome, makeFurniture, parseMinihome } from './model';
import { createMinihomeSession } from './session';
import { createShareLink, readShareLink } from './sharing';

export type ApiCheck = { id: string; title: string; apis: string[]; status: 'passed' | 'failed'; durationMs: number; detail: string };
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

/**
 * Runs the example's own checks against isolated fixtures; never edits the open home. Library entry contracts live in
 * src/__tests__/publicApiContracts.test.ts.
 */
export async function runMinihomeApiChecks(signal?: AbortSignal): Promise<ApiCheck[]> {
  const results: ApiCheck[] = [];
  async function check(id: string, title: string, apis: string[], run: () => void | Promise<void>) {
    if (signal?.aborted) throw new DOMException('검사 중지', 'AbortError');
    const start = performance.now();
    try { await run(); results.push({ id, title, apis, status: 'passed', durationMs: performance.now() - start, detail: '기대 상태 일치' }); }
    catch (error) { results.push({ id, title, apis, status: 'failed', durationMs: performance.now() - start, detail: error instanceof Error ? error.message : String(error) }); }
  }
  await check('home-history', '미니홈피 변경·undo/redo', ['createMinihomeSession', 'MinihomeSession.update', 'MinihomeSession.undo', 'MinihomeSession.redo', 'parseMinihome'], () => {
    const initial = createMinihome(); const session = createMinihomeSession(initial);
    try {
      session.update(data => ({ ...data, theme: 'sage' })); session.controller.dispatch({ type: 'scene-object.create', object: makeFurniture('lamp', 0, 0, 'added') });
      session.undo(); assert(JSON.stringify(session.getSnapshot().data.room) === JSON.stringify(initial.room), '객체 undo 실패'); session.undo(); assert(session.getSnapshot().data.theme === 'peach', '테마 undo 실패');
      session.redo(); session.redo(); assert(session.getSnapshot().data.room.objects.length === initial.room.objects.length + 1 && !!parseMinihome(JSON.stringify(session.getSnapshot().data)), 'redo 문서 불일치');
    } finally { session.dispose(); }
  });
  await check('home-sharing', '공유 링크·개인 기록 분리', ['createShareLink', 'readShareLink'], async () => {
    const home = createMinihome(); home.diary = [{ id: 'private', author: 'me', text: 'private', date: new Date(0).toISOString() }];
    const link = await createShareLink(home, 'https://example.test/'); const shared = await readShareLink(new URL(link).hash);
    assert(shared && JSON.stringify(shared.room) === JSON.stringify(home.room) && JSON.stringify(shared.terrain) === JSON.stringify(home.terrain) && shared.diary.length === 0 && home.diary.length === 1, '공유 또는 개인 기록 계약 불일치');
  });
  return results;
}
