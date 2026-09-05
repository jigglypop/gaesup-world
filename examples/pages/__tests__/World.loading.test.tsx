import { Suspense, useState, type ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { WorldPage } from '../World';

let mockLightingReady = false;
let mockLightingPromise: Promise<void>;
const mockRuntime = {};

jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('gaesup-world', () => ({
  ...jest.requireActual('gaesup-world'),
  GaesupWorld: ({ children }: { children: ReactNode }) => <>{children}</>,
  GaesupWorldContent: () => null,
  DynamicFog: () => null,
}));
jest.mock('../runtime', () => ({ createWorldRuntime: () => mockRuntime }));
jest.mock('../WorldEditorSurface', () => ({
  __esModule: true,
  default: function EditorRuntimeProbe() {
    const { useGaesupRuntime } = jest.requireActual('gaesup-world');
    return <div>{useGaesupRuntime() === mockRuntime ? '현재 월드 런타임' : '런타임 없음'}</div>;
  },
}));
jest.mock('../world/useWorldSystems', () => ({ WorldSystems: () => null }));
jest.mock('../world/scene', () => ({
  Ground: () => null,
  Scenery: () => null,
  Lighting: () => {
    if (!mockLightingReady) throw mockLightingPromise;
    return <div>조명 준비 완료</div>;
  },
}));

function EditingControls() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((value) => value + 1)}>편집 {count}</button>;
}

test('provides the world runtime to the separately loaded editor surface', async () => {
  mockLightingReady = true;
  render(<WorldPage showHud={false} showEditor />);
  expect(await screen.findByText('현재 월드 런타임')).toBeVisible();
});

test('keeps overlay controls interactive and preserves their state while lighting loads', async () => {
  let finishLoading = () => {};
  mockLightingReady = false;
  mockLightingPromise = new Promise<void>((resolve) => { finishLoading = resolve; });
  render(
    <Suspense fallback={<div>페이지 로딩</div>}>
      <WorldPage showHud={false} overlayChildren={<EditingControls />} />
    </Suspense>,
  );
  expect(screen.queryByText('페이지 로딩')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '편집 0' }));
  expect(screen.getByRole('button', { name: '편집 1' })).toBeVisible();
  await act(async () => {
    mockLightingReady = true;
    finishLoading();
    await mockLightingPromise;
  });
  expect(screen.getByText('조명 준비 완료')).toBeVisible();
  expect(screen.getByRole('button', { name: '편집 1' })).toBeVisible();
});
