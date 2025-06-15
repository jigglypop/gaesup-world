import { TELEPORT_POINTS } from '../constants';
export function TeleportButtons() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '360px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {TELEPORT_POINTS.map((point, index) => (
        <button
          key={index}
          onClick={() =>
            (window as any).teleportTo?.(point.position[0], point.position[1], point.position[2])
          }
          className="teleport-button"
        >
          {point.name}
        </button>
      ))}
    </div>
  );
}
