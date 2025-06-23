import { useTeleport } from '@hooks/useTeleport';
import { TeleportProps } from './types';
import './styles.css';

export function Teleport({ text, position, teleportStyle }: TeleportProps) {
  const { teleport, canTeleport } = useTeleport();

  const handleTeleport = () => {
    const success = teleport(position);
    if (!success) {
      console.warn('이동에 실패했습니다.');
    }
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
