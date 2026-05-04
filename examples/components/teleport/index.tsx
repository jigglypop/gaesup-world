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
    teleport(V3(x, y, z));
  };

  return (
    <div className="teleport-container">
      {TELEPORT_POINTS.map((point, index) => (
        <button
          key={index}
          onClick={() => {
            const [x, y, z] = point.position;
            if (x === undefined || y === undefined || z === undefined) return;
            void window.teleportTo?.(x, y, z);
          }}
          className="teleport-button"
        >
          {point.name}
        </button>
      ))}
    </div>
  );
}
