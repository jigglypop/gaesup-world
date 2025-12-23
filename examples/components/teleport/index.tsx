import { TELEPORT_POINTS } from './constants';
import { useTeleport, V3 } from '../../../src';
import './styles.css';

declare global {
  interface Window {
    teleportTo?: (x: number, y: number, z: number) => Promise<void>;
  }
}

export function Teleport() {
  const { teleport } = useTeleport();
  window.teleportTo = async (x: number, y: number, z: number) => {
    const success = await teleport(V3(x, y, z));
    if (!success) {
      console.warn(`Failed to teleport to (${x}, ${y}, ${z})`);
    }
  };

  return (
    <div className="teleport-container">
      {TELEPORT_POINTS.map((point, index) => (
        <button
          key={index}
          onClick={() =>
            window.teleportTo?.(point.position[0], point.position[1], point.position[2])
          }
          className="teleport-button"
        >
          {point.name}
        </button>
      ))}
    </div>
  );
}
