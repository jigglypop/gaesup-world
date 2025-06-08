import { useTeleport } from '../../hooks/useTeleport';
import './style.css';
import { TeleportProps } from './types';

export function Teleport({ text, position, teleportStyle }: TeleportProps) {
  const { teleport, canTeleport } = useTeleport();

  const handleTeleport = () => {
    const success = teleport(position);
    if (!success) {
      console.warn('Teleport operation failed');
    }
  };

  return (
    <div
      className={`teleport ${!canTeleport ? 'teleport--disabled' : ''}`}
      onClick={handleTeleport}
      style={teleportStyle}
      title={canTeleport ? 'Click to teleport' : 'Teleport not available'}
    >
      {text}
    </div>
  );
}
