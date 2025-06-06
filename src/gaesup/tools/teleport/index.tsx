import { useTeleport } from '../../hooks/useInputControls';
import './style.css';
import { teleportType } from './type.ts';

export function teleport({ text, position, teleportStyle }: teleportType) {
  const { Teleport } = useTeleport();
  return (
    <div
      className="teleport"
      onClick={() => {
        Teleport(position);
      }}
      style={teleportStyle}
    >
      {text}
    </div>
  );
}
