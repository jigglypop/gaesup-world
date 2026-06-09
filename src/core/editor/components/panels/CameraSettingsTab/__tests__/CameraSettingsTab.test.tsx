import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { CameraOptionType } from '../../../../../camera/core/types';
import { useGaesupStore } from '../../../../../stores/gaesupStore';
import { CameraSettingsTab } from '../index';
import type { CameraSettingsSection } from '../types';

type MockStoreState = {
  cameraOption: CameraOptionType;
  mode: { control: string };
  setCameraOption: (update: Partial<CameraOptionType>) => void;
};
type StoreSelector = (state: MockStoreState) => unknown;
type StoreMock = {
  mockImplementation: (implementation: (selector?: StoreSelector) => unknown) => void;
};
jest.mock('../../../../../stores/gaesupStore', () => ({
  useGaesupStore: jest.fn(),
}));
function getUseStoreMock(): StoreMock {
  return useGaesupStore as unknown as StoreMock;
}
const testSections: readonly CameraSettingsSection[] = [
  {
    key: 'test',
    title: 'Test Camera',
    fields: [
      {
        key: 'fov',
        label: 'FOV',
        kind: 'range',
        path: 'fov',
        min: 30,
        max: 120,
        step: 5,
        defaultValue: 75,
      },
      {
        key: 'focus',
        label: 'Focus',
        kind: 'checkbox',
        path: 'enableFocus',
        defaultValue: false,
      },
    ],
  },
];
describe('CameraSettingsTab', () => {
  const setCameraOption = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    const state: MockStoreState = {
      cameraOption: { fov: 75, enableFocus: false },
      mode: { control: 'thirdPerson' },
      setCameraOption,
    };
    getUseStoreMock().mockImplementation((selector) => (selector ? selector(state) : state));
  });
  afterEach(() => {
    cleanup();
  });
  test('기본 섹션과 현재 모드를 렌더링해야 한다', () => {
    render(<CameraSettingsTab sections={testSections} />);
    expect(screen.getByText('Test Camera')).toBeInTheDocument();
    expect(screen.getByText('Mode: thirdPerson')).toBeInTheDocument();
    expect(screen.getByLabelText('FOV')).toBeInTheDocument();
  });
  test('range 변경 시 store 업데이트를 호출해야 한다', () => {
    render(<CameraSettingsTab sections={testSections} />);
    fireEvent.change(screen.getByLabelText('FOV'), { target: { value: '90' } });
    expect(setCameraOption).toHaveBeenCalledWith({ fov: 90 });
  });
  test('controlled 변경 콜백이 있으면 store 대신 콜백을 호출해야 한다', () => {
    const onCameraOptionChange = jest.fn();
    render(
      <CameraSettingsTab
        cameraOption={{ fov: 75, enableFocus: false }}
        mode={{ control: 'fixed' }}
        sections={testSections}
        onCameraOptionChange={onCameraOptionChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Focus'));
    expect(onCameraOptionChange).toHaveBeenCalledWith(
      { enableFocus: true },
      expect.objectContaining({ key: 'focus' }),
      true,
    );
    expect(setCameraOption).not.toHaveBeenCalled();
  });
  test('렌더러로 모드와 섹션 외피를 교체할 수 있어야 한다', () => {
    render(
      <CameraSettingsTab
        sections={testSections}
        renderers={{
          mode: (context) => <strong>{context.mode.control}</strong>,
          section: (_, section, children) => (
            <article key={section.key} data-testid="custom-section">
              <span>{section.title}</span>
              {children}
            </article>
          ),
        }}
      />,
    );
    expect(screen.getByText('thirdPerson')).toBeInTheDocument();
    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
  });
});
