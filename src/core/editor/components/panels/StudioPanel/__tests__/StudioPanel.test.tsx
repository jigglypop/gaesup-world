import { act, fireEvent, render, screen } from '@testing-library/react';

import { StudioPanel } from '..';
import { getSaveSystem, SaveSystem, type SaveBlob } from '../../../../../save';
import { createGaesupRuntime, GaesupRuntimeProvider } from '../../../../../runtime';
import { logger } from '../../../../../utils/logger';

afterEach(() => jest.restoreAllMocks());

test('uses the active runtime for saving, loading, listing and export', async () => {
  let stored: SaveBlob | null = null;
  let value = 7;
  const adapter = {
    read: jest.fn(async () => stored),
    write: jest.fn(async (_slot: string, blob: SaveBlob) => { stored = blob; }),
    list: jest.fn(async () => ['main']),
    remove: jest.fn(async () => {}),
  };
  const save = new SaveSystem({ adapter });
  save.register({
    key: 'building', serialize: () => ({ value }),
    hydrate: (data) => { value = (data as { value: number }).value; },
  });
  const globalSave = jest.spyOn(getSaveSystem(), 'save');
  const onExportBundle = jest.fn();
  render(<GaesupRuntimeProvider runtime={createGaesupRuntime({ saveSystem: save })}>
    <StudioPanel onExportBundle={onExportBundle} validateBundle={() => ({ ok: true, errors: [] })} />
  </GaesupRuntimeProvider>);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '현재 월드 저장' })); });
  expect(adapter.write).toHaveBeenCalledWith('main', expect.objectContaining({ domains: { building: { value: 7 } } }));
  expect(adapter.list).toHaveBeenCalledTimes(1);
  expect(globalSave).not.toHaveBeenCalled();
  value = 99;
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '슬롯 불러오기' })); });
  expect(adapter.read).toHaveBeenCalledWith('main');
  expect(value).toBe(7);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'JSON 내보내기' })); });
  expect(onExportBundle.mock.calls[0]?.[0].world.domains).toEqual({ building: { value: 7 } });
});

test('does not export incomplete world data and can retry after serialization recovers', async () => {
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  const serialize = jest.fn()
    .mockImplementationOnce(() => { throw new Error('building serialization failed'); })
    .mockReturnValue({ wallGroups: [] });
  jest.spyOn(getSaveSystem(), 'getBindings').mockImplementation(() => new Map([
    ['building', { key: 'building', serialize, hydrate: () => undefined }],
  ]).values());
  const onExportBundle = jest.fn();
  render(<StudioPanel onExportBundle={onExportBundle} />);
  const button = screen.getByRole('button', { name: 'JSON 내보내기' });
  await act(async () => { fireEvent.click(button); });
  expect(onExportBundle).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('번들 내보내기에 실패했습니다.');
  expect(button).toBeEnabled();
  await act(async () => { fireEvent.click(button); });
  expect(onExportBundle).toHaveBeenCalledTimes(1);
  expect(onExportBundle.mock.calls[0]?.[0].world.domains.building).toEqual({ wallGroups: [] });
  expect(screen.getByRole('status')).toHaveTextContent('콘텐츠 번들 JSON을 내보냈습니다.');
});

test('awaits export completion, prevents duplicate actions and allows retry after rejection', async () => {
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  let rejectExport: (reason: Error) => void = () => {};
  const onExportBundle = jest.fn().mockImplementationOnce(() => new Promise<void>((_resolve, reject) => {
    rejectExport = reject;
  })).mockResolvedValue(undefined);
  render(<StudioPanel onExportBundle={onExportBundle} validateBundle={() => ({ ok: true, errors: [] })} />);
  const button = screen.getByRole('button', { name: 'JSON 내보내기' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(onExportBundle).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  expect(screen.getByRole('button', { name: '현재 월드 저장' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('번들 내보내기 중입니다.');
  await act(async () => { rejectExport(new Error('offline')); });
  expect(screen.getByRole('status')).toHaveTextContent('번들 내보내기에 실패했습니다.');
  expect(button).toBeEnabled();
  await act(async () => { fireEvent.click(button); });
  expect(onExportBundle).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('status')).toHaveTextContent('콘텐츠 번들 JSON을 내보냈습니다.');
});

test.each([
  ['onSaveWorld', '현재 월드 저장', '월드 저장'],
  ['onLoadWorld', '슬롯 불러오기', '월드 불러오기'],
] as const)('reports rejected %s operations', async (prop, button, label) => {
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  const operation = jest.fn().mockRejectedValue(new Error('storage unavailable'));
  render(<StudioPanel {...{ [prop]: operation }} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: button })); });
  expect(operation).toHaveBeenCalledWith('main');
  expect(screen.getByRole('status')).toHaveTextContent(`${label}에 실패했습니다.`);
  expect(screen.getByRole('button', { name: button })).toBeEnabled();
});

test('distinguishes a committed save from a failed slot refresh', async () => {
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(getSaveSystem(), 'list').mockRejectedValue(new Error('list failed'));
  const onSaveWorld = jest.fn().mockResolvedValue(undefined);
  render(<StudioPanel onSaveWorld={onSaveWorld} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '현재 월드 저장' })); });
  expect(onSaveWorld).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('status')).toHaveTextContent('저장했지만 목록을 갱신하지 못했습니다.');
});
