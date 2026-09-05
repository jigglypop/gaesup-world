import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { EntityController } from '../EntityController';

const mockGaesupState = {
  mode: { type: 'character' as const },
  rideable: {},
  urls: {
    airplaneUrl: '',
    characterUrl: '',
    ridingUrl: '',
    vehicleUrl: '',
    wheelUrl: '',
  },
};
let mockBuildingEditMode = false;
const mockGameStates = {
  canRide: false,
  currentRideable: undefined,
  isFalling: false,
  isJumping: false,
  isMoving: false,
  isNotMoving: true,
  isNotRunning: true,
  isOnTheGround: true,
  isRiding: false,
  isRunning: false,
  nearbyRideable: undefined,
  rideableDistance: undefined,
};
const mockUseKeyboard = jest.fn();

jest.mock('@hooks/useGenericRefs', () => ({
  useGenericRefs: () => ({
    colliderRef: { current: null },
    innerGroupRef: { current: null },
    outerGroupRef: { current: null },
    rigidBodyRef: { current: null },
  }),
}));

jest.mock('@hooks/useKeyboard', () => ({
  useKeyboard: (...args: unknown[]) => mockUseKeyboard(...args),
}));

jest.mock('@react-three/rapier', () => ({
  vec3: () => ({ x: 0, y: 0, z: 0 }),
}));

jest.mock('../../../building/stores/buildingStore', () => ({
  useBuildingStore: (selector: (state: { isInEditMode: () => boolean }) => unknown) =>
    selector({ isInEditMode: () => mockBuildingEditMode }),
}));

jest.mock('../../../stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: typeof mockGaesupState) => unknown) =>
    selector(mockGaesupState),
}));

jest.mock('../../entities/refs/PhysicsEntity', () => ({
  PhysicsEntity: ({ children }: { children?: ReactNode }) => (
    <div data-testid="physics-entity">{children}</div>
  ),
}));

jest.mock('../../hooks/useStateSystem', () => ({
  useStateSystem: () => ({ gameStates: mockGameStates }),
}));

describe('EntityController', () => {
  test('passes keyboard eligibility to the input subscription', () => {
    const view = render(<EntityController props={{ enableKeyboard: false }} />);
    expect(mockUseKeyboard).toHaveBeenLastCalledWith(true, true, undefined, false);
    view.rerender(<EntityController props={{}} />);
    expect(mockUseKeyboard).toHaveBeenLastCalledWith(true, true, undefined, true);
  });

  beforeEach(() => {
    mockBuildingEditMode = false;
    mockGaesupState.urls.characterUrl = '';
    jest.clearAllMocks();
  });

  test('keeps hook order stable while readiness and edit eligibility change', () => {
    const { rerender } = render(
      <EntityController props={{}}>
        <span>controlled child</span>
      </EntityController>,
    );
    expect(screen.queryByTestId('physics-entity')).not.toBeInTheDocument();

    mockGaesupState.urls.characterUrl = '/character.glb';
    rerender(
      <EntityController props={{}}>
        <span>controlled child</span>
      </EntityController>,
    );
    expect(screen.getByTestId('physics-entity')).toHaveTextContent('controlled child');

    mockBuildingEditMode = true;
    rerender(
      <EntityController props={{}}>
        <span>controlled child</span>
      </EntityController>,
    );
    expect(screen.queryByTestId('physics-entity')).not.toBeInTheDocument();

    mockBuildingEditMode = false;
    rerender(
      <EntityController props={{}}>
        <span>controlled child</span>
      </EntityController>,
    );
    expect(screen.getByTestId('physics-entity')).toBeInTheDocument();
    expect(mockUseKeyboard).toHaveBeenCalledTimes(4);
  });
});
