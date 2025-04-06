// teleport.tsx
import { useTeleport } from '../../hooks/useTeleport';
import * as S from './style.css';
import { teleportType } from './type.ts';

export function teleport({ text, position, teleportStyle }: teleportType) {
  const { Teleport } = useTeleport();

  return (
    <div
      className={S.teleport}
      onClick={() => {
        Teleport(position);
      }}
      style={teleportStyle}
    >
      {text}
    </div>
  );
}
