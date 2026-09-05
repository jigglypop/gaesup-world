import { render, screen } from '@testing-library/react';

import type { TileConfig } from '../../../types';
import { TileObject } from '../index';

const mockUseFrame = jest.fn();

jest.mock('@react-three/fiber', () => ({
  useFrame: (callback: unknown, priority?: number) => mockUseFrame(callback, priority),
}));

jest.mock('../../mesh/grass/Grass', () => ({
  __esModule: true,
  default: () => <div data-testid="grass-cover" />,
}));

jest.mock('../../mesh/water', () => ({
  __esModule: true,
  default: () => <div data-testid="water-cover" />,
}));

function createTile(objectType: NonNullable<TileConfig['objectType']>): TileConfig {
  return {
    id: 'tile-1',
    objectType,
    position: { x: 0, y: 0, z: 0 },
    tileGroupId: 'group-1',
  };
}

describe('TileObject', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('mounts hook ownership only while the tile is independently rendered', () => {
    const { rerender } = render(<TileObject tile={createTile('none')} />);
    expect(screen.queryByTestId('water-cover')).not.toBeInTheDocument();
    expect(mockUseFrame).not.toHaveBeenCalled();

    rerender(<TileObject tile={createTile('water')} />);
    expect(screen.getByTestId('water-cover')).toBeInTheDocument();
    expect(mockUseFrame).toHaveBeenCalled();

    rerender(<TileObject tile={createTile('sand')} />);
    expect(screen.queryByTestId('water-cover')).not.toBeInTheDocument();

    rerender(<TileObject tile={createTile('grass')} />);
    expect(screen.getByTestId('grass-cover')).toBeInTheDocument();
    expect(consoleErrorSpy.mock.calls.join(' ')).not.toMatch(
      /Rendered (?:more|fewer) hooks|change in the order of Hooks/,
    );
  });
});
