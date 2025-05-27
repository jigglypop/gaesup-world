import { useState } from 'react';
import { usePushKey } from '../../hooks/usePushKey';
import * as S from './style.css';
import { GamePadButtonType } from './type';

export default function GamePadButton({ value, name, gamePadButtonStyle }: GamePadButtonType) {
  const [isClicked, setIsClicked] = useState(false);
  const { pushKey } = usePushKey();

  const onMouseDown = () => {
    pushKey(value, true);
    setIsClicked(true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
    setIsClicked(false);
  };

  return (
    <button
      className={`${S.padButton} ${isClicked ? S.isClicked : ''}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseLeave}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={onMouseDown}
      onPointerUp={onMouseLeave}
      style={gamePadButtonStyle}
    >
      {name}
    </button>
  );
}
