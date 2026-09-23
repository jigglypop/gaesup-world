import { createSceneDocument, createSceneDocumentController, parseSceneDocument } from 'gaesup-world';

import { checkAbort, nextFrame, type ScenarioContext, type Scenario } from './types';

async function edit(ctx: ScenarioContext) {
  const count = ctx.config.count;
  const controller = createSceneDocumentController(createSceneDocument({ id: 'edit-benchmark', objects: Array.from({ length: count }, (_, i) => ({ id: `object-${i}`, name: `Object ${i}`, components: [{ id: `data-${i}`, type: 'bench', data: { enabled: true, value: i } }] })) }));
  let notifications = 0; const off = controller.subscribe(() => notifications++);
  const first = controller.getSnapshot();
  try {
    for (let i = 0; i < 120; i++) {
      checkAbort(ctx.signal);
      const index = i % count;
      const before = controller.getSnapshot();
      const started = performance.now();
      const result = controller.dispatch({ type: 'scene-object.update', objectId: `object-${index}`, patch: { transform: { position: [i + 1, 0, 2] } } });
      const elapsed = performance.now() - started;
      ctx.assert(`edit-${i}`, true, result.accepted);
      if (i >= 20) ctx.sample('document-command', elapsed, 'ms', `single-transform-update-${count}-objects`);
      ctx.assert(`previous-snapshot-${i}`, false, before.objects[index]!.transform.position[0] === i + 1);
      if (i % 20 === 19) { ctx.progress(`${i + 1}/120 commands`); await nextFrame(ctx.signal); }
    }
    const final = controller.getSnapshot();
    ctx.assert('original-snapshot-preserved', true, first.objects.every(object => object.transform.position[0] === 0));
    ctx.assert('final-document-valid', true, parseSceneDocument(final).ok);
    ctx.assert('notifications', 120, notifications);
    const revision = controller.getRevision();
    const rejected = controller.dispatch({ type: 'scene-object.update', objectId: 'object-0', patch: { parentId: 'missing' } });
    ctx.assert('invalid-parent-rejected', false, rejected.accepted);
    ctx.assert('rejected-snapshot-unchanged', true, final === controller.getSnapshot());
    ctx.assert('rejected-revision-unchanged', revision, controller.getRevision());
    ctx.unavailable('gpu-time', 'ms', 'scene-command-cpu', '문서 명령은 CPU 작업입니다. 렌더링·GPU 성능을 측정하지 않습니다.');
  } finally { off(); }
}

export const documentScenarios: Scenario[] = [{ id: 'document-edit', title: '장면 문서 편집', description: '실제 공개 controller로 단일 transform 변경을 측정하고 불변 snapshot·유효성·revision을 검사합니다.', version: 1, requirementIds: ['R20'], run: edit }];
