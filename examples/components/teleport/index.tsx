import { V3, teleportDestinationToVector3, useTeleport } from 'gaesup-world';

import { TELEPORT_POINTS } from './constants';
import './styles.css';

declare global {
  interface Window {
    teleportTo?: (x: number, y: number, z: number) => Promise<void>;
    teleportToDestination?: (id: string) => Promise<void>;
  }
}

export function Teleport() {
  const { teleport } = useTeleport();
  window.teleportTo = async (x: number, y: number, z: number) => {
    teleport(V3(x, y, z));
  };
  window.teleportToDestination = async (id: string) => {
    const destination = TELEPORT_POINTS.find((point) => point.id === id);
    if (!destination) return;
    teleport(teleportDestinationToVector3(destination));
  };

  return (
    <div className="teleport-container">
      {TELEPORT_POINTS.map((point) => (
        <button
          key={point.id}
          onClick={() => {
            void window.teleportToDestination?.(point.id);
          }}
          className="teleport-button"
        >
          {point.name}
        </button>
      ))}
    </div>
  );
}
