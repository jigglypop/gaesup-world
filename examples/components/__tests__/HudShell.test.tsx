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
  test('compact mode mounts tools only when opened and closes active panels with the menu', () => {
    render(
      <HudShell compact>
        <div data-testid="feature-tools" />
      </HudShell>,
    );
    expect(screen.queryByTestId('feature-tools')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '월드 도구' }));
    expect(screen.getByTestId('feature-tools')).toBeTruthy();
    expect(screen.queryByText('도구 펼치기')).toBeNull();
    fireEvent.click(screen.getByText('월드 설정'));
    expect(screen.getByTestId('info-panel')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '도구 닫기' }));
    expect(screen.queryByTestId('feature-tools')).toBeNull();
    expect(screen.queryByTestId('info-panel')).toBeNull();
  });

  test('월드 설정과 빠른 이동는 같은 자리를 쓰므로 동시에 열리지 않는다', () => {
    render(<HudShell />);
    fireEvent.click(screen.getByText('월드 설정'));
    expect(screen.getByTestId('info-panel')).toBeTruthy();
    fireEvent.click(screen.getByText('빠른 이동'));
    expect(screen.getByTestId('teleport-panel')).toBeTruthy();
    expect(screen.queryByTestId('info-panel')).toBeNull();
    fireEvent.click(screen.getByText('빠른 이동'));
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
