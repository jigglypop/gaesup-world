import { useTeleport } from '@hooks/useTeleport';
import { TeleportProps } from './types';
import './styles.css';

export function Teleport({ text, position, teleportStyle }: TeleportProps) {
  const { teleport, canTeleport } = useTeleport();
  const handleTeleport = () => {
    teleport(position);
  };

  return (
    <div
      className={`teleport ${!canTeleport ? 'teleport--disabled' : ''}`}
      onClick={handleTeleport}
      style={teleportStyle}
      title={canTeleport ? 'Click to teleport' : 'Teleport not available'}
    >
      {text || 'Teleport'}
      {!canTeleport && <span className="teleport__cooldown">⏱️</span>}
    </div>
  );
}

export default Teleport;
