import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { GameplayEventPanel } from '..';
import { createManualToastEventBlueprint } from '../../../../../gameplay';
import { logger } from '../../../../../utils/logger';

test('retains one-time execution history across edits while accepting new event definitions', async () => {
  const blueprint = createManualToastEventBlueprint({ id: 'once', name: '최초 실행', triggerKey: 'once', message: '안내' });
  blueprint.actions = [{ type: 'setFlag', key: 'visited', value: true }];
  blueprint.policy = { run: 'once' };
  const view = render(<GameplayEventPanel blueprints={[blueprint]} />);
  const run = () => fireEvent.click(screen.getByRole('button', { name: '실행', exact: true }));
  await act(async () => { run(); });
  expect(screen.getByRole('status')).toHaveTextContent('이벤트를 실행했습니다');
  view.rerender(<GameplayEventPanel blueprints={[{ ...blueprint, name: '수정한 이름' }]} />);
  await act(async () => { run(); });
  expect(screen.getByRole('status')).toHaveTextContent('이미 실행한 일회성 이벤트입니다.');
  view.rerender(<GameplayEventPanel blueprints={[{
    ...blueprint, id: 'next', name: '다음 이벤트', trigger: { type: 'manual', key: 'next' },
    conditions: [{ type: 'flagEquals', key: 'visited', value: true }],
  }]} />);
  await act(async () => { run(); });
  expect(screen.getByRole('status')).toHaveTextContent('이벤트를 실행했습니다: 다음 이벤트');
});

test('waits for an event run and permits retry after failure', async () => {
  const log = jest.spyOn(logger, 'error').mockImplementation(() => {});
  let rejectRun: (error: Error) => void = () => {};
  const onRun = jest.fn().mockImplementationOnce(() => new Promise<void>((_resolve, reject) => {
    rejectRun = reject;
  })).mockResolvedValue(undefined);
  const blueprint = createManualToastEventBlueprint({ id: 'run', name: '실행 체험', triggerKey: 'run', message: '안내' });
  const view = render(<GameplayEventPanel blueprints={[blueprint]} onRun={onRun} />);
  try {
    const run = screen.getByRole('button', { name: '실행', exact: true });
    fireEvent.click(run);
    fireEvent.click(run);
    expect(onRun).toHaveBeenCalledTimes(1);
    expect(run).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('이벤트 실행 중');
    await act(async () => { rejectRun(new Error('failed')); });
    expect(screen.getByRole('status')).toHaveTextContent('이벤트 실행에 실패했습니다');
    expect(run).toBeEnabled();
    await act(async () => { fireEvent.click(run); });
    expect(screen.getByRole('status')).toHaveTextContent('이벤트를 실행했습니다');
  } finally {
    view.unmount();
    log.mockRestore();
  }
});

test('explains server-only events instead of reporting successful execution', async () => {
  const blueprint = createManualToastEventBlueprint({ id: 'server', name: '서버 이벤트', triggerKey: 'server', message: '안내' });
  blueprint.policy = { requiresServer: true };
  render(<GameplayEventPanel blueprints={[blueprint]} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '실행', exact: true })); });
  expect(screen.getByRole('status')).toHaveTextContent('서버에서 실행해야 하는 이벤트입니다.');
  expect(screen.getByRole('status')).not.toHaveTextContent('이벤트를 실행했습니다');
});

test('localized choices preserve event type and execution policy values', () => {
  const blueprint = createManualToastEventBlueprint({ id: 'event', name: '체험 이벤트', triggerKey: 'test', message: '안내' });
  const onUpdate = jest.fn();
  render(<GameplayEventPanel blueprints={[blueprint]} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole('button', { name: '편집', exact: true }));
  const conditions = screen.getByRole('combobox', { name: '조건 유형' });
  const actions = screen.getByRole('combobox', { name: '동작 유형' });
  expect(within(conditions).getByRole('option', { name: '아이템 보유' })).toHaveValue('hasItem');
  expect(within(actions).getByRole('option', { name: '아이템 지급' })).toHaveValue('giveItem');
  fireEvent.change(conditions, { target: { value: 'hasItem' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].conditions.at(-1)).toMatchObject({ type: 'hasItem', count: 1 });
  fireEvent.change(actions, { target: { value: 'giveItem' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].actions.at(-1)).toMatchObject({ type: 'giveItem', count: 1 });
  fireEvent.change(screen.getByRole('combobox', { name: '실행 방식' }), { target: { value: 'once' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].policy.run).toBe('once');
  const server = screen.getByRole('combobox', { name: '서버 필요' });
  expect(within(server).getByRole('option', { name: '필요 없음' })).toHaveValue('false');
  fireEvent.change(server, { target: { value: 'true' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].policy.requiresServer).toBe(true);
});

test('keeps numeric-looking toast messages as text', () => {
  const blueprint = createManualToastEventBlueprint({ id: 'message', name: '메시지', triggerKey: 'test', message: '안내' });
  const onUpdate = jest.fn();
  render(<GameplayEventPanel blueprints={[blueprint]} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole('button', { name: '편집', exact: true }));
  for (const value of ['00123', 'true', 'false']) {
    fireEvent.change(screen.getByRole('textbox', { name: '내용', exact: true }), { target: { value } });
    expect(onUpdate.mock.calls.at(-1)?.[0].actions[0].text).toBe(value);
  }
});

test('localized notification and quest choices save canonical values', () => {
  const blueprint = createManualToastEventBlueprint({ id: 'choices', name: '선택 메뉴', triggerKey: 'test', message: '안내' });
  blueprint.trigger = { type: 'questChanged', questId: 'quest', status: 'active' };
  blueprint.conditions = [{ type: 'questStatus', questId: 'quest', status: 'available' }];
  const onUpdate = jest.fn();
  render(<GameplayEventPanel blueprints={[blueprint]} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole('button', { name: '편집', exact: true }));
  const kind = screen.getByRole('combobox', { name: '알림 종류' });
  expect(within(kind).getAllByRole('option').map(option => option.textContent)).toEqual(['안내', '성공', '주의', '오류', '보상', '우편']);
  fireEvent.change(kind, { target: { value: 'reward' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].actions[0].kind).toBe('reward');
  const [triggerStatus, conditionStatus] = screen.getAllByRole('combobox', { name: '상태', exact: true });
  expect(triggerStatus).toHaveValue('active');
  expect(conditionStatus).toHaveValue('available');
  expect(within(triggerStatus!).getByRole('option', { name: '완료', exact: true })).toHaveValue('completed');
  fireEvent.change(triggerStatus!, { target: { value: 'completed' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].trigger.status).toBe('completed');
  fireEvent.change(conditionStatus!, { target: { value: 'failed' } });
  expect(onUpdate.mock.calls.at(-1)?.[0].conditions[0].status).toBe('failed');
});
