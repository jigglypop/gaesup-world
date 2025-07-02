import React from 'react';
import { render } from '@testing-library/react';
import { VehicleAnimation } from '../VehicleAnimation';
import { useGaesupStore } from '@stores/gaesupStore';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: jest.fn()
}));

const mockUseGaesupStore = useGaesupStore as jest.Mock;

describe('VehicleAnimation', () => {
  let mockActions: any;

  beforeEach(() => {
    mockActions = {
      idle: { reset: jest.fn().mockReturnThis(), play: jest.fn(), stop: jest.fn() },
      walk: { reset: jest.fn().mockReturnThis(), play: jest.fn(), stop: jest.fn() },
      run: { reset: jest.fn().mockReturnThis(), play: jest.fn(), stop: jest.fn() },
      fly: { reset: jest.fn().mockReturnThis(), play: jest.fn(), stop: jest.fn() }
    };
  });

  it('아무런 입력이 없을 때 idle 애니메이션을 실행해야 합니다.', () => {
    mockUseGaesupStore.mockReturnValue({ interaction: { keyboard: {} } });
    render(
      <VehicleAnimation actions={mockActions} isActive={true} modeType="vehicle" />
    );
    expect(mockActions.idle.play).toHaveBeenCalled();
  });

  it('전진 입력이 있을 때 walk 애니메이션을 실행해야 합니다.', () => {
    mockUseGaesupStore.mockReturnValue({
      interaction: { keyboard: { forward: true } }
    });
    render(
      <VehicleAnimation actions={mockActions} isActive={true} modeType="vehicle" />
    );
    expect(mockActions.walk.play).toHaveBeenCalled();
  });

  it('전진과 shift 입력이 있을 때 run 애니메이션을 실행해야 합니다.', () => {
    mockUseGaesupStore.mockReturnValue({
      interaction: { keyboard: { forward: true, shift: true } }
    });
    render(
      <VehicleAnimation actions={mockActions} isActive={true} modeType="vehicle" />
    );
    expect(mockActions.run.play).toHaveBeenCalled();
  });

  it('비행기 모드일 때 fly 애니메이션을 실행해야 합니다.', () => {
    mockUseGaesupStore.mockReturnValue({ interaction: { keyboard: {} } });
    render(
      <VehicleAnimation actions={mockActions} isActive={true} modeType="airplane" />
    );
    expect(mockActions.fly.play).toHaveBeenCalled();
  });
}); 