import { useEffect } from 'react';

import { Canvas } from '@react-three/fiber';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, WorldInputSurface, useKeyboard, useToolUse, ToolUseController, TouchControls, getItemRegistry, createEditorShortcutRegistry } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

async function worldKeyboard(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); const root = createRoot(ctx.host);
  const hits = { A: 0, B: 0 }; let trustedKeys = 0;
  let controllers = 0;
  function Tools() { useEffect(() => { controllers++; return () => { controllers--; }; }, []); return <ToolUseController cooldownMs={0} />; }
  const registry = getItemRegistry(); const definitions = registry.all(); const item = `keyboard-tool-${crypto.randomUUID()}`;
  registry.register({ id: item, name: item, icon: '', category: 'tool', stackable: false, maxStack: 1, toolKind: 'shovel' });
  function World({ id }: { id: 'A' | 'B' }) {
    useKeyboard(); useToolUse('shovel', () => { hits[id]++; });
    return <WorldInputSurface data-input-world={id} style={{ position: 'relative', transform: 'translateZ(0)', border: '1px solid #547c72', padding: 12, width: '45%', height: 240 }}>
      <div tabIndex={0} data-focus-target style={{ padding: 20, background: '#20372f' }}>월드 {id} 입력 영역</div>
      <input aria-label={`월드 ${id} 텍스트`} placeholder="여기는 글 입력" />
      <Canvas style={{ height: 70 }}><Tools /></Canvas>
      <TouchControls forceVisible actions={[{ id: 'tool', label: `도구 ${id}`, key: 'F' }]} />
    </WorldInputSurface>;
  }
  const keyCount = (event: KeyboardEvent) => { if (event.isTrusted) trustedKeys++; };
  const waitStep = async (step: string, instruction: string, type: 'keydown' | 'keyup' | 'pointerdown', predicate: (event: Event) => boolean) => {
    const prompt = ctx.host.querySelector<HTMLElement>('[data-input-prompt]')!;
    prompt.textContent = instruction; ctx.host.dataset['inputStep'] = step;
    ctx.progress(instruction);
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => { window.removeEventListener(type, event, true); ctx.signal.removeEventListener('abort', aborted); clearTimeout(timer); };
      const event = (value: Event) => { if (predicate(value)) { cleanup(); resolve(); } };
      const aborted = () => { cleanup(); reject(new DOMException('입력 재현 중지', 'AbortError')); };
      const timer = setTimeout(() => { cleanup(); reject(new Error(`입력 대기 시간 초과: ${step}`)); }, 60000);
      window.addEventListener(type, event, true); ctx.signal.addEventListener('abort', aborted, { once: true });
    });
    await nextFrame(ctx.signal);
  };
  const key = (code: string) => (event: Event) => (event as KeyboardEvent).code === code;
  const check = (id: string, actual: number) => { ctx.sample(id, actual, 'count', 'actual-dom-focus-keyboard-and-touch'); ctx.assert(id, 0, actual); };
  try {
    await a.setup(); await b.setup();
    a.inventoryStore.getState().add(item); b.inventoryStore.getState().add(item);
    flushSync(() => root.render(<><p data-input-prompt /><div style={{ display: 'flex', gap: 16 }}><GaesupRuntimeProvider runtime={a}><World id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><World id="B" /></GaesupRuntimeProvider></div></>));
    for (let i = 0; i < 180 && controllers < 2; i++) await nextFrame(ctx.signal);
    if (controllers !== 2) throw new Error('Canvas input controllers did not mount');
    window.addEventListener('keydown', keyCount, true);
    await waitStep('a-w', 'A 입력 영역을 클릭하고 W를 누른 채 유지하세요.', 'keydown', key('KeyW'));
    check('dom-keyboard-cross-world-leaks', Number(!a.inputAdapter.getKeyboard().forward) + Number(b.inputAdapter.getKeyboard().forward));
    await waitStep('focus-b', 'W를 유지한 채 B 입력 영역을 클릭하세요.', 'pointerdown', event => (event.target as HTMLElement)?.closest('[data-input-world="B"]') !== null);
    check('held-keys-after-focus-change', Number(a.inputAdapter.getKeyboard().forward) + Number(b.inputAdapter.getKeyboard().forward));
    await waitStep('b-f', 'W를 놓고 B에서 F를 한 번 누르세요.', 'keyup', key('KeyF'));
    check('dom-tool-cross-world-leaks', Number(hits.A !== 0) + Number(hits.B !== 1));
    await waitStep('editor', 'B의 텍스트 칸을 클릭하고 wf를 입력하세요.', 'keyup', key('KeyF'));
    check('text-editing-gameplay-leaks', Number(a.inputAdapter.getKeyboard().forward) + Number(b.inputAdapter.getKeyboard().forward) + Number(hits.A !== 0) + Number(hits.B !== 1));
    const before = { ...hits };
    await waitStep('touch-a', 'A의 도구 A 터치 버튼을 누르세요.', 'keyup', key('KeyF'));
    check('touch-action-cross-world-leaks', Number(hits.A !== before.A + 1) + Number(hits.B !== before.B));
    await a.dispose(); await nextFrame(ctx.signal);
    await waitStep('disposed-a', '종료된 A 입력 영역을 클릭하고 W를 눌렀다 놓으세요.', 'keydown', key('KeyW'));
    check('disposed-world-keyboard-leaks', Number(a.inputAdapter.getKeyboard().forward) + Number(b.inputAdapter.getKeyboard().forward));
    await a.setup(); await nextFrame(ctx.signal);
    await waitStep('restarted-a', 'W를 놓은 뒤 A에서 다시 W를 누르세요.', 'keydown', key('KeyW'));
    check('restarted-world-keyboard-mismatches', Number(!a.inputAdapter.getKeyboard().forward) + Number(b.inputAdapter.getKeyboard().forward));
    ctx.sample('trusted-keyboard-events', trustedKeys, 'count', 'native-browser-keyboard-isTrusted');
    ctx.assert('trusted-keyboard-input-used', true, trustedKeys >= 5);
  } finally {
    window.removeEventListener('keydown', keyCount, true); delete ctx.host.dataset['inputStep'];
    flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); registry.clear(); registry.registerAll(definitions);
  }
}

export const keyboardScenarios: Scenario[] = [
  { id: 'world-keyboard-focus', title: '실제 키보드·포커스·터치 격리', description: '안내에 따라 두 월드의 입력 영역·텍스트·터치 버튼을 조작합니다. 자동 검증도 같은 화면에 실제 브라우저 키 입력을 보냅니다.', version: 1, requirementIds: ['R25'], run: worldKeyboard },
  { id: 'editor-shortcuts', title: '편집기 단축키 매칭·등록 수명', description: '운영 shortcut registry에서 등록하지 않은 키, 서로 다른 Ctrl 조합, 이전 등록의 해제를 검사합니다.', version: 1, requirementIds: ['R25'], run: async ctx => {
    const actions: string[] = [];
    const registry = createEditorShortcutRegistry([
      { id: 'undo', label: 'Undo', key: 'z', ctrl: true, run: () => { actions.push('undo'); } },
      { id: 'duplicate', label: 'Duplicate', key: 'd', ctrl: true, run: () => { actions.push('duplicate'); } },
      { id: 'delete', label: 'Delete', key: 'Delete', run: () => { actions.push('delete'); } },
    ]);
    for (const [key, ctrl] of [['a', false], ['w', false], ['k', true]] as const) registry.handleKeyDown(new KeyboardEvent('keydown', { key, ctrlKey: ctrl, cancelable: true }));
    const unregistered = actions.length;
    ctx.sample('unregistered-shortcut-executions', unregistered, 'count', 'actual-editor-shortcut-registry'); ctx.assert('unregistered-shortcut-executions', 0, unregistered);
    actions.length = 0; registry.handleKeyDown(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, cancelable: true }));
    const mismatch = Number(actions.join(',') !== 'duplicate'); ctx.sample('shortcut-command-mismatches', mismatch, 'count', 'actual-editor-shortcut-registry'); ctx.assert('shortcut-command-mismatches', 0, mismatch);
    const old = registry.register({ id: 'owned', label: 'Old', key: 'F2', run: () => {} });
    registry.register({ id: 'owned', label: 'Current', key: 'F3', run: () => {} }); old(); old();
    const removed = Number(!registry.list().some(binding => binding.id === 'owned' && binding.key === 'F3'));
    ctx.sample('shortcut-stale-cleanup-removals', removed, 'count', 'actual-editor-shortcut-registry'); ctx.assert('shortcut-stale-cleanup-removals', 0, removed);
    ctx.host.textContent = `미등록 키 실행 ${unregistered}, 명령 불일치 ${mismatch}, 이전 cleanup 삭제 ${removed}`;
  } },
];
