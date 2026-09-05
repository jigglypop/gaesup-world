import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CameraPanel } from '../CameraPanel';

describe('CameraPanel', () => {
  test('커스텀 탭 렌더러로 내용을 교체할 수 있어야 한다', () => {
    render(
      <CameraPanel
        tabs={[
          {
            id: 'Settings',
            label: 'Lens',
            render: () => <div>Lens body</div>,
          },
        ]}
      />,
    );
    expect(screen.getByText('Lens')).toBeInTheDocument();
    expect(screen.getByText('Lens body')).toBeInTheDocument();
  });
  test('탭 변경 콜백과 커스텀 root renderer를 사용할 수 있어야 한다', () => {
    const onTabChange = jest.fn();
    render(
      <CameraPanel
        onTabChange={onTabChange}
        tabs={[
          { id: 'Settings', label: 'Lens', render: () => <div>Lens body</div> },
          { id: 'Debug', label: 'Telemetry', render: () => <div>Telemetry body</div> },
        ]}
        renderers={{
          root: (_, children) => <section data-testid="camera-panel-root">{children}</section>,
        }}
      />,
    );
    fireEvent.click(screen.getByText('Telemetry'));
    expect(onTabChange).toHaveBeenCalledWith('Debug');
    expect(screen.getByText('Telemetry body')).toBeInTheDocument();
    expect(screen.getByTestId('camera-panel-root')).toBeInTheDocument();
  });
});
