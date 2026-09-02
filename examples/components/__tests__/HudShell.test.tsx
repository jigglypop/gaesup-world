import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { HudShell } from '../hud/HudShell';

type BuildingStoreLike = {
  showSnow: boolean;
  setShowSnow: (value: boolean) => void;
  showFog: boolean;
  setShowFog: (value: boolean) => void;
};

jest.mock('../info', () => ({
  __esModule: true,
  default: () => <div data-testid="info-panel" />,
}));
jest.mock('../teleport', () => ({
  Teleport: () => <div data-testid="teleport-panel" />,
}));
jest.mock('gaesup-world', () => ({
  SceneFader: () => null,
  useBuildingStore: (selector: (state: BuildingStoreLike) => unknown) =>
    selector({ showSnow: false, setShowSnow: () => {}, showFog: false, setShowFog: () => {} }),
}));

describe('HudShell 레이어 배치', () => {
  test('정보 패널과 텔레포트는 같은 자리를 쓰므로 동시에 열리지 않는다', () => {
    render(<HudShell />);
    fireEvent.click(screen.getByText('정보 패널'));
    expect(screen.getByTestId('info-panel')).toBeTruthy();
    fireEvent.click(screen.getByText('텔레포트'));
    expect(screen.getByTestId('teleport-panel')).toBeTruthy();
    expect(screen.queryByTestId('info-panel')).toBeNull();
    fireEvent.click(screen.getByText('텔레포트'));
    expect(screen.queryByTestId('teleport-panel')).toBeNull();
  });
  test('children은 좌측 레일 흐름 안에 들어가고 우측 성능 패널은 셸에 중복 마운트되지 않는다', () => {
    const { container } = render(
      <HudShell>
        <div data-testid="rail-child" />
      </HudShell>,
    );
    expect(screen.getByTestId('rail-child').closest('.gp-left')).not.toBeNull();
    expect(container.querySelector('.gp-performance-panel')).toBeNull();
    expect(container.querySelector('.gp-right')).toBeNull();
  });
});
