import { useEffect } from 'react';

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
  useEffect(() => {
    const previousTo = window.teleportTo;
    const previousDestination = window.teleportToDestination;
    const teleportTo = async (x: number, y: number, z: number) => {
      teleport(V3(x, y, z));
    };
    const teleportToDestination = async (id: string) => {
      const destination = TELEPORT_POINTS.find((point) => point.id === id);
      if (destination) teleport(teleportDestinationToVector3(destination));
    };
    window.teleportTo = teleportTo;
    window.teleportToDestination = teleportToDestination;
    return () => {
      if (window.teleportTo === teleportTo) {
        if (previousTo) window.teleportTo = previousTo;
        else delete window.teleportTo;
      }
      if (window.teleportToDestination === teleportToDestination) {
        if (previousDestination) window.teleportToDestination = previousDestination;
        else delete window.teleportToDestination;
      }
    };
  }, [teleport]);

  return (
    <div className="teleport-container">
      {TELEPORT_POINTS.map((point) => (
        <button
          type="button"
          key={point.id}
          onClick={() => {
            teleport(teleportDestinationToVector3(point));
          }}
          className="teleport-button"
        >
          {point.name}
        </button>
      ))}
    </div>
  );
}
