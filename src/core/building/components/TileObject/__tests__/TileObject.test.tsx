import { render, screen } from '@testing-library/react';

import { frameScheduler } from '../../../../runtime/frame';
import type { TileConfig } from '../../../types';
import { TileObject } from '../index';

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: { get: () => object }) => unknown) => selector({ get: () => ({}) }),
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
    frameScheduler.clear();
  });

  test('mounts hook ownership only while the tile is independently rendered', () => {
    const { rerender } = render(<TileObject tile={createTile('none')} />);
    expect(screen.queryByTestId('water-cover')).not.toBeInTheDocument();
    expect(frameScheduler.count('effects')).toBe(0);

    rerender(<TileObject tile={createTile('water')} />);
    expect(screen.getByTestId('water-cover')).toBeInTheDocument();
    expect(frameScheduler.count('effects')).toBe(1);

    rerender(<TileObject tile={createTile('sand')} />);
    expect(screen.queryByTestId('water-cover')).not.toBeInTheDocument();

    rerender(<TileObject tile={createTile('grass')} />);
    expect(screen.getByTestId('grass-cover')).toBeInTheDocument();
    expect(consoleErrorSpy.mock.calls.join(' ')).not.toMatch(
      /Rendered (?:more|fewer) hooks|change in the order of Hooks/,
    );
  });
});
