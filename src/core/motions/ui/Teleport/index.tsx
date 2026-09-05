import { useTeleport } from '@hooks/useTeleport';

import { TeleportProps } from './types';
import './styles.css';

export function Teleport({ text, position, teleportStyle }: TeleportProps) {
  const { teleport, canTeleport } = useTeleport();
  const handleTeleport = () => {
    teleport(position);
  };

  return (
    <button
      type="button"
      disabled={!canTeleport}
      className={`teleport ${!canTeleport ? 'teleport--disabled' : ''}`}
      onClick={handleTeleport}
      style={teleportStyle}
      title={canTeleport ? '순간이동' : '지금은 순간이동할 수 없습니다.'}
    >
      {text || '순간이동'}
      {!canTeleport && <span className="teleport__cooldown">⏱️</span>}
    </button>
  );
}

export default Teleport;
