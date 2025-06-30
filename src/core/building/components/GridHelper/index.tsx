import { TILE_CONSTANTS } from '../../types/constants';

interface GridHelperProps {
  size?: number;
  divisions?: number;
  color1?: string;
  color2?: string;
}

export function GridHelper({ 
  size = TILE_CONSTANTS.DEFAULT_GRID_SIZE, 
  divisions = size / TILE_CONSTANTS.GRID_CELL_SIZE,
  color1 = '#888888',
  color2 = '#444444'
}: GridHelperProps) {
  return (
    <gridHelper 
      args={[size, divisions, color1, color2]} 
      position={[0, 0.01, 0]}
    />
  );
}